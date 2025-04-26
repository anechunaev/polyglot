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
		droppedLetters: string[];
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
	public id: GameId;
	private max_score: number;
	public eventBus: EventBus;
	public sessions: string[];

	constructor(eventBus: EventBus, settings: IGameSettings, user: IUser, dictionary: IDictionary, sessionId: string) {
		const timer = new Timer(settings.timer || DEFAULT_TIMER_VALUE_SEC, this.onTimerTick, this.onTimerEnd);
		const lettersService = new LettersService(letterConfig);
		const initialWord = dictionary.getInitialWord();
		const field = generateFieldSchema();

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
				droppedLetters: [],
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

	public addLetter(payload: IAddLetter) {
		const { position, letterId } = payload;

		this.state.field[position.y][position.x] = letterId;

		this.state.turn?.droppedLetters.push(letterId);
		
		this.eventBus.emit(EVENTS.UPDATE_TURN_LETTERS, {dropppedLetters: this.state.turn?.droppedLetters, sessions: this.sessions});
		this.eventBus.emit(EVENTS.UPDATE_TURN_FIELD, { field: this.state.field, sessions: this.sessions });
	}

	public removeLetter({letterId}: IRemoveLetter) {
		const droppedLetter = this.state.turn?.droppedLetters.indexOf(letterId);
		if (droppedLetter && droppedLetter !== -1) {
			this.state.turn?.droppedLetters.splice(droppedLetter, 1);
		}

		this.state.field.forEach((row, rowIndex) => {
			row.forEach((cellContent, cellIndex) => {
				if (cellContent === letterId) {
					console.log('------REMOVE LETTER----- ', letterId, generateFieldSchema()[rowIndex][cellIndex]);
					this.state.field[rowIndex][cellIndex] = generateFieldSchema()[rowIndex][cellIndex];
				}
			})
		});

		this.eventBus.emit(EVENTS.UPDATE_TURN_LETTERS, {dropppedLetters: this.state.turn?.droppedLetters, sessions: this.sessions});
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
		// @TODO 
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
