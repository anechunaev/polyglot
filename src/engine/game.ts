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
	
	private generateWords = () => {
		const data: IWords = this.state.turn!.droppedLetters.reduce((acc, droppedLetterId) => {
		
		const position = {y: 0, x: 0};
		for (let i = 0; i < this.state.field.length; i++) {
			for (let j = 0; j < this.state.field[i].length; j++) {
				if (this.state.field[i][j] === droppedLetterId) {
					position.y = i;
					position.x = j;
					break;
				}
			}
		}

		if (Object.keys(acc).length) {
			const { changedWords } = this.updateCurrentWords(acc, droppedLetterId, position);
			const newWords = this.makeNewWords(droppedLetterId, position);
			acc = { ...changedWords, ...newWords };
		} else {
			const newWords = this.makeNewWords(droppedLetterId, position);
			acc = { ...newWords };
		}
			
		return acc;
		}, {});

		const res = Object.values(data).map(item => {
			const {letterIds} = item;

			const word = letterIds.map(letterId => this.state!.letters![letterId].value);

			return {...item, word };
		});

		console.log('----WORDS: ----', res);
	}

	private makeNewWords = (letterId: string, position: { x: number; y: number }) => {
		const verticalWord = this.makeWord(letterId, position, 'y');
		const horizontalWord =this.makeWord(letterId, position, 'x');
		let response: IWords = {};

		if (!Object.keys(verticalWord).length && !Object.keys(horizontalWord).length) {
			// слово из одной буквы
			const wordId = [letterId].join(';');

			response[wordId] = {
				start: `${position.x};${position.y}`,
				letterIds: [letterId],
				kind: 'vertical'
			}
		}

		if (Object.keys(verticalWord).length) {
			response = { ...response, ...verticalWord };
		}

		if (Object.keys(horizontalWord).length) {
			response = { ...response, ...horizontalWord };
		}

		return response;
	}

	private makeWord = (letterId: string, startPosition: { x: number; y: number }, axis: 'y' | 'x') => {
		const letters = [letterId];
		const topLimit = 0;
		const bottomLimit = this.state.field.length - 1;
		let wordStartPosition = `${startPosition.x};${startPosition.y}`;
		let up = startPosition[axis] > topLimit;

		const result: IWords = {};

		const walk = (pos: { x: number; y: number }): any => {
			const position = { ...pos };
			if (up) {
				--position[axis];

				const data = this.state.field[position.y][position.x];
				const isLetter = data && !isNaN(Number(data));

				if (!isLetter) {
					up = false;
					return walk(startPosition);
				}

				wordStartPosition = `${position.x};${position.y}`;
				letters.unshift(data);

				return walk(position);
			}
			if (position[axis] === bottomLimit) {
				return;
			}

			++position[axis];

			const data = this.state.field[position.y][position.x];
			const isLetter = data && !isNaN(Number(data));

			if (!isLetter) {
				return;
			}

			letters.push(data);
			return walk(position);

		}

		walk(startPosition);

		if (letters.length > 1) {
			const wordId = letters.join(';');

			result[wordId] = {
				start: wordStartPosition,
				letterIds: letters,
				kind: axis === 'y' ? 'vertical' : 'horizontal'
			}
		}

		return result;
	}

	private updateCurrentWords = (data: IWords, letterId: string, position: { x: number; y: number }) => {
		const newLetterPosition = `${position.x};${position.y}`;

		const newWords = Object.keys(data).reduce<IWords>((acc, wordId) => {
			const word = data[wordId];
			const { start, letterIds, kind } = word;

			const newWord = { ...word };

			const [x, y] = start.split(';');

			let upperLetterPosition;
			let bottomLetterPosition;

			if (kind === 'vertical') {
				const verticalLimit = Number(y) + (letterIds.length - 1);

				upperLetterPosition = `${x};${Number(y) - 1}`;
				bottomLetterPosition = `${x};${Number(verticalLimit) + 1}`;

			} else {
				const horizontalLimit = Number(x) + (letterIds.length - 1);
				upperLetterPosition = `${Number(x) - 1};${y}`;
				bottomLetterPosition = `${Number(horizontalLimit) + 1};${y}`;
			}

			if (newLetterPosition === upperLetterPosition || newLetterPosition === bottomLetterPosition) {
				if (newLetterPosition === upperLetterPosition) {
					newWord.start = newLetterPosition;
					newWord.letterIds.unshift(letterId);
				} else if (newLetterPosition === bottomLetterPosition) {
					newWord.letterIds.push(letterId);
				}

				delete acc[wordId];
				const newId = newWord.letterIds.join(';');

				acc[newId] = newWord;
			} else {

				acc[wordId] = newWord;
			}

			return acc;
		}, {});

		return { changedWords: newWords };
	}

	public addLetter(payload: IAddLetter) {
		const { position, letterId } = payload;

		this.state.field[position.y][position.x] = letterId;

		this.state.turn?.droppedLetters.push(letterId);

		this.generateWords();
		
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
					this.state.field[rowIndex][cellIndex] = generateFieldSchema()[rowIndex][cellIndex];
				}
			})
		});

		this.generateWords();

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
