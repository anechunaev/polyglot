import uuid4 from 'uuid4';
import { ITimerInstance, Timer } from '../server/services/Timer';
import type { ILettersService } from '../server/services/Letters';
import type { IDictionary } from '../server/services/dictionary';
import type { Letters, UserId, GameId, Field, IPlayer, ISpectator, IUser, IWords, IAddLetter, IRemoveLetter } from '../types';
import { generateFieldSchema } from './helpers';
import type { EventBus } from '../controller/eventBus';
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
	words: IWords;
}

export type IPrevTurn = ITurn;

export interface IState {
	activePlayer: UserId;
	players: {
		[playerId: string]: IPlayer;
	};
	spectators: IUser[];
	letters?: Letters;
	field: Field;
	timer: {
		time: number;
		total: number;
	};
	turn?: {
		droppedLetters: Map<string, any>;
		words: IWords
	}
}

export interface IGame {
	nextTurn: (turn: ITurn, secret: string) => void;
	start: () => void;
	eventBus: EventBus;
	canJoin: (max_players: number) => boolean;
	getPlayers: () => Array<string>;
	join: (sessionId: string, player: ISpectator | IPlayer, pwd?: string) => void;
	getState: () => IState;
	sessions: string[];
	addLetter: (payload: IAddLetter) => void;
	removeLetter: (payload: IRemoveLetter) => void;
}

export class GameEngine implements IGame {
	private state: IState;
	private timer: ITimerInstance;
	private letters: ILettersService;
	private _defaultField: Field;
	public id: GameId;
	private max_score: number;
	public eventBus: EventBus;
	public sessions: string[];

	constructor(eventBus: EventBus, settings: IGameSettings, user: IUser, dictionary: IDictionary, sessionId: string) {
		const timer = new Timer(settings.timer || DEFAULT_TIMER_VALUE_SEC, this.onTimerTick, this.onTimerEnd);
		const lettersService = new LettersService(letterConfig);
		const initialWord = dictionary.getInitialWord();

		const field = generateFieldSchema();
		this._defaultField = field;

		this.state = {
			activePlayer: user.id,
			players: {
				[user.id]: {
					...user,
					letters: lettersService.getRandomLetters(PLAYER_DEFAULT_LETTERS_COUNT),
					role: ROLES.PARTICIPANT,
					score: 0,
				},
			},
			spectators: [],
			field,
			timer: {
				time: settings.timer,
				total: settings.timer,
			},
			turn: {
				droppedLetters: new Map(),
				words: {}
			}
		};

		const letters = this.placeWordOnTheField(initialWord, lettersService.getLetters());

		this.state.letters = letters;
		this.sessions = [sessionId];

		this.id = uuid4();
		this.timer = timer;
		this.letters = lettersService;
		this.max_score = settings.max_score;
		this.eventBus = eventBus;

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
				words: {},
			},
			this.state.players[this.state.activePlayer].secret!,
		);
	}

	private getNextPlayerId() {
		const players = Object.keys(this.state.players);
		const currentPlayerIndex = players.indexOf(this.state.activePlayer);

		const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;

		return players[nextPlayerIndex];
	}

	public calculateWordScore() { }

	public addLetter(payload: IAddLetter) {
		// @todo: PLACE LETTER TO THE FIELD

		const { position, letterId } = payload;

		this.state.field[position.y][position.x] = letterId;

		this.eventBus.emit(EVENTS.UPDATE_TURN_FIELD, { field: this.state.field, sessions: this.sessions });
	}

	public removeLetter({letterId}: IRemoveLetter) {
		this.state.field.forEach((row, rowIndex) => {
			row.forEach((cellContent, cellIndex) => {
				if (cellContent === letterId) {
					this.state.field[rowIndex][cellIndex] = this._defaultField[rowIndex][cellIndex];
				}
			})
		});

		this.state.field[0][0] = null;

		this.eventBus.emit(EVENTS.UPDATE_TURN_FIELD, { field: this.state.field, sessions: this.sessions });
	}

	private placeWordOnTheField(word: string, letters: Letters) {
		let newLetters = { ...letters };
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
						const top = position.y;
						const left = position.x + i;
						newLetters = {
							...newLetters,
							[letterId]: {
								...newLetters[letterId],
								located: {
									in: 'field',
									position: {
										x: left,
										y: top
									}
								}
							}

						};

						this.state.field[top][left] = letterId;
						break;

					}
				}
			}
		}

		return newLetters;
	}

	public nextTurn(turn: ITurn, secret: string) {
		const player = this.state.players[this.state.activePlayer];

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

		this.state.players[this.state.activePlayer] = player;

		this.state.activePlayer = this.getNextPlayerId();

		if (player.score >= this.max_score) {
			this.finish(player);
		}

		this.eventBus.emit(EVENTS.ON_NEXT_TURN, { gameId: this.id, data: this.state, sessions: this.sessions });
	}

	public onTimerTick = (time: number, total: number) => {
		this.eventBus.emit(EVENTS.ON_TIMER_TICK, { gameId: this.id, data: { time, total }, sessions: this.sessions });
	};

	public getState() {
		return this.state;
	}

	public finish(player?: IPlayer) {
		this.eventBus.emit(EVENTS.ON_FINISH_GAME, { gameId: this.id, data: { winner: { name: player?.name, score: player?.score } }, sessions: this.sessions });
	}

	public canJoin(max_players: number) {
		return !(max_players === Object.keys(this.state.players).length);
	}

	public join(sessionId: string, user: ISpectator | IPlayer) {
		if (user.role === ROLES.SPECTATOR) {
			this.state.spectators.push(user);
		} else {
			this.state.players[user.id] = user;
		}

		this.sessions.push(sessionId);
	}
}
