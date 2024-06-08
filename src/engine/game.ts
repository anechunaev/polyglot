import uuid4 from 'uuid4';
import type { Emit } from '../server/controller';
import { ITimerInstance, Timer } from '../server/services/Timer';
import type { ILettersService } from '../server/services/Letters';
import type { IDictionary } from '../server/services/dictionary';
import type { LetterId, Letters, UserId, GameId, Field, IPlayer, ISpectator, IUser, IWord } from '../types';
import { generateFieldSchema } from './helpers';
import {
	EVENTS,
	DEFAULT_TIMER_VALUE_SEC,
	PLAYER_MAX_LETTERS_CAPACITY,
	PLAYER_DEFAULT_LETTERS_COUNT,
	ROLES,
} from '../constants';
import { LettersService } from '../server/services/Letters';
import letterConfig from '../server/config/letters_rus.json';

export interface IGameSettings {
	timer: number;
	max_score: number;
}

export interface ITurn {
	words: IWord[];
}

export type IPrevTurn = ITurn;

export interface IState {
	active_player: UserId;
	players: {
		[playerId: string]: IPlayer;
	};
	spectators: IUser[];
	letters: Letters;
	field: Field;
	timer: {
		time: number;
		total: number;
	};
}

export interface IGame {
	nextTurn: (turn: ITurn, secret: string) => void;
	start: () => void;
	emit: Emit;
	canJoin: (max_players: number) => boolean;
	getPlayers: () => Array<string>;
	join: (player: ISpectator | IPlayer, pwd?: string) => void;
	getState: () => IState;
}

export class GameEngine implements IGame {
	private state: IState;
	private timer: ITimerInstance;
	private letters: ILettersService;
	public id: GameId;
	private max_score: number;
	public emit: Emit;

	constructor(emit: Emit, settings: IGameSettings, user: IUser, dictionary: IDictionary) {
		const timer = new Timer(settings.timer, this.onTimerTick, this.onTimerEnd);
		const lettersService = new LettersService(letterConfig);
		const initialWord = dictionary.getInitialWord();

		const letters = this.placeWordOnTheField(initialWord, lettersService.getLetters());

		this.state = {
			active_player: user.id,
			players: {
				[user.id]: {
					...user,
					letters: lettersService.getRandomLetters(PLAYER_DEFAULT_LETTERS_COUNT),
					role: ROLES.PARTICIPANT,
					score: 0,
				},
			},
			spectators: [],
			letters: letters,
			field: generateFieldSchema(),
			timer: {
				time: settings.timer,
				total: settings.timer,
			},
		};

		this.id = uuid4();
		this.timer = timer;
		this.letters = lettersService;
		this.max_score = settings.max_score;
		this.emit = emit;

	}

	public start() {
		this.timer.start();
	}

	public getPlayers() {
		return Object.keys(this.state.players);
	}

	public onTimerEnd() {
		this.nextTurn(
			{
				words: [],
			},
			this.state.players[this.state.active_player].secret!,
		);
	}

	private getNextPlayerId() {
		const players = Object.keys(this.state.players);
		const currentPlayerIndex = players.indexOf(this.state.active_player);

		const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;

		return players[nextPlayerIndex];
	}

	public calculateWordScore() { }

	private placeWordOnTheField(word: string, letters: Letters) {
		let newLetters = {...letters};
		let test = 1;

		const position = {
			x: 4,
			y: 7
		};

		for (let i = 0; i < word.length; i++) {
			const wordLetter = word[i].toUpperCase();

			for (let j = 0; j < Object.keys(newLetters).length; j++) {
				const letterId = Object.keys(newLetters)[j];
				const letter = newLetters[letterId];

				if (letter.value === wordLetter) {
					if (letter.located.in === 'stock') {
						test = 2 + j;
						newLetters = {
							...newLetters,
							[letterId]: {
								...newLetters[letterId],
								located: {
									in: 'field',
									position: {
										x: position.x + i,
										y: position.y
									}
								}
							}
						}
						break;

					}
				}
			}
		}

		return newLetters;
	}

	public nextTurn(turn: ITurn, secret: string) {
		const player = this.state.players[this.state.active_player];

		if (secret !== player.secret) {
			console.error('Not a valid user for the current turn');
		}

		const newSecret = uuid4();

		// if (turn.words.length) {
		// 	turn.words.forEach((word) => {
		// 		let score = 0;
		// 		let wordMultiplier = 0;
		// 		const { letters, position, type } = word;

		// 		letters.forEach((letterId, index) => {
		// 			const letter = this.state.letters[letterId];

		// 			letter.located = {
		// 				in: 'field',
		// 				// position: {
		// 				// 	x: type === 'horizontal' ? position.x + index : position.x,
		// 				// 	y: type === 'vertical' ? position.y + index : position.y,
		// 				// },
		// 			};
		// 			const fieldBonus = this.state.field[letter.located.position.y][letter.located.position.x];

		// 			if (fieldBonus) {
		// 				switch (fieldBonus) {
		// 					case 'w3':
		// 						wordMultiplier += 3;
		// 						break;
		// 					case 'w2':
		// 						wordMultiplier += 2;
		// 						break;
		// 					case 'l3':
		// 						letter.price *= 3;
		// 						break;
		// 					case 'l2':
		// 						letter.price *= 2;
		// 						break;
		// 					default:
		// 						return null;
		// 				}
		// 				// each bonus could be used only once during the game
		// 				this.state.field[letter.located.position.y][letter.located.position.x] = null;
		// 			}

		// 			score += letter.price;
		// 			this.state.letters[letterId] = letter;
		// 		});

		// 		if (wordMultiplier) {
		// 			score *= wordMultiplier;
		// 		}

		// 		this.state.players[turn.playerId].score += score;
		// 	});
		// }

		player.secret = newSecret;

		const lettersCount = PLAYER_MAX_LETTERS_CAPACITY - player.letters.length;

		if (lettersCount) {
			const letterIds = this.letters.getRandomLetters(lettersCount);

			player.letters = [...player.letters, ...letterIds];
		}

		this.state.players[this.state.active_player] = player;

		this.state.active_player = this.getNextPlayerId();

		if (player.score >= this.max_score) {
			this.finish(player);
		}

		this.emit(this.id, EVENTS.ON_NEXT_TURN, this.state);
	}

	public onTimerTick = (time: number, total: number) => {
		this.emit(this.id, EVENTS.ON_TIMER_TICK, { time, total });
	};

	public getState() {
		return this.state;
	}

	public finish(player?: IPlayer) {
		this.emit(this.id, EVENTS.ON_FINISH_GAME, { winner: { name: player?.name, score: player?.score } });
	}

	public canJoin(max_players: number) {
		return !(max_players === Object.keys(this.state.players).length);
	}

	public join(user: ISpectator | IPlayer) {
		if (user.role === ROLES.SPECTATOR) {
			this.state.spectators.push(user);
		} else {
			this.state.players[user.id] = user;
		}
	}
}
