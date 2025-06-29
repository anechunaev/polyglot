import uuid4 from 'uuid4';
import { ITimerInstance, Timer } from '../server/services/Timer';
import type { IDictionary } from '../server/services/dictionary';
import type {
	Letters,
	UserId,
	GameId,
	Field,
	IPlayer,
	ISpectator,
	IUser,
	IWord,
	IWords,
	IAddLetter,
	IRemoveLetter,
	LetterId,
} from '../types';
import { generateFieldSchema } from './helpers';
import type { EventBus } from '../controller/eventBus';
import { EVENTS, DEFAULT_TIMER_VALUE_SEC, PLAYER_DEFAULT_LETTERS_COUNT, ROLES } from '../constants';
import { LettersService } from '../server/services/Letters';
import letterConfig from '../server/config/letters_rus.json';

export interface IGameSettings {
	timer: number;
	max_score: number;
}

export interface ITurn {
	droppedLetters: string[];
	words: IWord[];
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
		words: IWord[];
	};
	allVisibleLettersMap: Letters;
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
	changeLetters: (letters: string[]) => void;
}

export class GameEngine implements IGame {
	private state: IState;
	private timer: ITimerInstance;
	public id: GameId;
	private letters: LettersService;
	private initialField: Field;
	private max_score: number;
	public eventBus: EventBus;
	private dictionary: IDictionary;
	public sessions: string[];
	private previousTurnWords: IWord[] = [];
	private allWords: IWord[] = [];

	constructor(eventBus: EventBus, settings: IGameSettings, user: IUser, dictionary: IDictionary, sessionId: string) {
		const timer = new Timer(settings.timer || DEFAULT_TIMER_VALUE_SEC, this.onTimerTick, this.onTimerEnd);
		const lettersService = new LettersService(letterConfig);
		const initialWord = dictionary.getInitialWord();
		const field = generateFieldSchema();
		const initialField = generateFieldSchema();

		this.state = {
			activePlayer: user.id,
			players: {
				[user.id]: {
					...user,
					letters: [],
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
				words: [],
			},
			allVisibleLettersMap: {}, // Set of letters visible for active user
			letters: {}, // Letters on the field
		};

		this.sessions = [sessionId];

		this.id = uuid4();
		this.timer = timer;
		this.max_score = settings.max_score;
		this.eventBus = eventBus;
		this.letters = lettersService;
		this.dictionary = dictionary;
		this.initialField = initialField;

		this.state.letters = this.placeWordOnTheField(initialWord);
		this.letters.shuffle();
		this.state.players[user.id].letters = this.letters.getRandomLetters(PLAYER_DEFAULT_LETTERS_COUNT);
		this.calculateVisibleLetters(user.id)
	}

	public start() {
		this.timer.start();
	}

	public getPlayers() {
		return Object.keys(this.state.players);
	}

	private calculateVisibleLetters(playerId: string) {
		const player = this.state.players[playerId];
		const playerHandLetters: Letters = {};
		const droppedLetters: Letters = {};
		if (player) {
			player.letters.reduce((acc, letterId) => {
				const letter = this.letters.getLetter(letterId);
				if (letter) {
					acc[letterId] = letter;
				}
				return acc;
			}, playerHandLetters);

			if (this.state.activePlayer === playerId) {
				this.state.turn?.droppedLetters.reduce((acc, letterId) => {
					const letter = this.letters.getLetter(letterId);
					if (letter) {
						acc[letterId] = letter;
					}
					return acc;
				}, droppedLetters);
			}
		}
		this.state.allVisibleLettersMap = { ...playerHandLetters, ...droppedLetters, ...this.state.letters};
	}

	private handleWords = () => {
		const data = this.generateWords();

		const res = Object.values(data).map((item) => {
			const { letterIds } = item;
			const renderedWord = letterIds.map((letterId) => this.state.allVisibleLettersMap[letterId].value).join('');
			const isValid = this.validateWord(letterIds, renderedWord);
			const score = this.calculateWordScore(item);

			return { ...item, isValid, score, renderedWord };
		});

		this.state.turn!.words = res;

		this.previousTurnWords = [];

		this.eventBus.emit(EVENTS.UPDATE_TURN_WORDS, { words: this.state.turn!.words, sessions: this.sessions });
	};

	private validateWord = (letters: LetterId[], renderedWord: string) => {
		if (letters.length < 2) {
			return false;
		}

		const isNotUsed = !this.allWords.some((word) => word.renderedWord === renderedWord);

		if (!isNotUsed) {
			return false;
		}

		const isInDictionary = this.dictionary.checkWord(renderedWord.toLowerCase());

		if (!isInDictionary) {
			return false;
		}

		const isConnected = letters.reduce<boolean>((acc, letterId) => {
			if (acc) {
				return acc;
			}
			return acc || this.isLetterConnected(letterId);
		}, false);

		return isConnected;
	};

	private isLetterConnected = (letterId: string) => {
		const neighbourIds = this.letters.getNeighbours(letterId);

		if (Array.isArray(neighbourIds)) {
			if (!neighbourIds.length) {
				return false;
			}

			return neighbourIds.reduce<boolean>((acc, neighbourId): boolean => {
				if (acc) {
					return acc;
				}
				return acc || this.isLetterConnected(neighbourId);
			}, false);
		}

		return true;
	}

	private calculateWordScore = (word: IWord) => {
		let [y, x] = word.start.split(';').map(Number);

		let score = 0;
		let wordMultiplier = 0;

		for (let i = 0; i < word.letterIds.length; i++) {
			const cell = this.initialField[y][x];

			let letterPrice = this.letters.getLetter(word.letterIds[i])?.price || 1;

			if (cell.bonus) {
				switch (cell.bonus) {
					case 'w3':
						wordMultiplier += 3;
						break;
					case 'w2':
						wordMultiplier += 2;
						break;
					case 'l3':
						letterPrice *= 3;
						break;
					case 'l2':
						letterPrice *= 2;
						break;
					default:
						return undefined;
				}
			}

			score += letterPrice;

			if (word.kind === 'vertical') {
				y++;
			} else if (word.kind === 'horizontal') {
				x++;
			}
		}

		if (wordMultiplier) {
			score *= wordMultiplier;
		}

		return score;
	};

	private generateWords = () => {
		const data: IWords = this.state.turn!.droppedLetters.reduce((acc, droppedLetterId) => {
			const position = { y: 0, x: 0 };
			for (let i = 0; i < this.state.field.length; i++) {
				for (let j = 0; j < this.state.field[i].length; j++) {
					if (this.state.field[i][j].letterId === droppedLetterId) {
						position.y = i;
						position.x = j;
						break;
					}
				}
			}

			if (Object.keys(acc).length) {
				const { changedWords } = GameEngine.updateCurrentWords(acc, droppedLetterId, position);
				const newWords = this.makeNewWords(droppedLetterId, position);
				Object.assign(acc, changedWords, newWords);
			} else {
				const newWords = this.makeNewWords(droppedLetterId, position);
				Object.assign(acc, newWords);
			}

			return acc;
		}, {});

		return data;
	};

	private makeNewWords = (letterId: string, position: { x: number; y: number }) => {
		const verticalWord = this.makeWord(letterId, position, 'y');
		const horizontalWord = this.makeWord(letterId, position, 'x');
		let response: IWords = {};

		if (!Object.keys(verticalWord).length && !Object.keys(horizontalWord).length) {
			// слово из одной буквы
			const wordId = [letterId].join(';');

			response[wordId] = {
				start: `${position.y};${position.x}`,
				letterIds: [letterId],
				kind: 'vertical',
				renderedWord: this.letters.getLetter(letterId)?.value || '',
			};
		}

		if (Object.keys(verticalWord).length) {
			response = { ...response, ...verticalWord };
		}

		if (Object.keys(horizontalWord).length) {
			response = { ...response, ...horizontalWord };
		}

		return response;
	};

	private makeWord = (letterId: string, startPosition: { x: number; y: number }, axis: 'y' | 'x') => {
		const letters = [letterId];
		const topLimit = 0;
		const bottomLimit = this.state.field.length - 1;
		let wordStartPosition = `${startPosition.y};${startPosition.x}`;
		let up = startPosition[axis] > topLimit;

		const result: IWords = {};

		const walk = (pos: { x: number; y: number }): any => {
			const position = { ...pos };
			if (up) {
				--position[axis];

				const cell = this.state.field[position.y][position.x];
				const isLetter = Boolean(cell.letterId);

				if (!isLetter) {
					up = false;
					return walk(startPosition);
				}

				wordStartPosition = `${position.y};${position.x}`;
				letters.unshift(cell.letterId!);

				return walk(position);
			}
			if (position[axis] === bottomLimit) {
				return;
			}

			++position[axis];

			const cell = this.state.field[position.y][position.x];
			const isLetter = Boolean(cell.letterId);

			if (isLetter) {
				letters.push(cell.letterId!);
				return walk(position);
			}

			
		};

		walk(startPosition);

		if (letters.length > 1) {
			const wordId = letters.join(';');

			result[wordId] = {
				start: wordStartPosition,
				letterIds: letters,
				kind: axis === 'y' ? 'vertical' : 'horizontal',
				renderedWord: letters.map((letterId) => this.letters.getLetter(letterId)?.value ?? '').join(''),
			};
		}

		return result;
	};

	private static updateCurrentWords = (data: IWords, letterId: string, position: { x: number; y: number }) => {
		const newLetterPosition = `${position.y};${position.x}`;

		const newWords = Object.keys(data).reduce<IWords>((acc, wordId) => {
			const word = data[wordId];
			const { start, letterIds, kind } = word;

			const newWord = { ...word };

			const [y, x] = start.split(';');

			let upperLetterPosition;
			let bottomLetterPosition;

			if (kind === 'vertical') {
				const verticalLimit = Number(y) + (letterIds.length - 1);

				upperLetterPosition = `${Number(y) - 1};${x}`;
				bottomLetterPosition = `${Number(verticalLimit) + 1};${x}`;
			} else {
				const horizontalLimit = Number(x) + (letterIds.length - 1);
				upperLetterPosition = `${y};${Number(x) - 1}`;
				bottomLetterPosition = `${y};${Number(horizontalLimit) + 1}`;
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
	};

	public addLetter(payload: IAddLetter) {
		const { position, letterId } = payload;

		this.state.field[position.y][position.x] = this.state.field[position.y][position.x] ?? {
			bonus: null,
			letterId: null,
		};
		this.state.field[position.y][position.x].letterId = letterId;

		const { x, y } = position;
		const neighbours: LetterId[] = [];

		const directions = [
			{ dx: -1, dy: 0 }, // left
			{ dx: 1, dy: 0 },  // right
			{ dx: 0, dy: -1 }, // up
			{ dx: 0, dy: 1 },  // down
		];

		for (const { dx, dy } of directions) {
			const nx = x + dx;
			const ny = y + dy;
			if (
				ny >= 0 &&
				ny < this.state.field.length &&
				nx >= 0 &&
				nx < this.state.field[ny].length
			) {
				const neighbourLetterCell = this.state.field[ny][nx];
				if (neighbourLetterCell && neighbourLetterCell.letterId) {
					neighbours.push(neighbourLetterCell.letterId);
				}
			}
		}

		this.letters.setNeighbours(letterId, neighbours);

		this.state.turn?.droppedLetters.push(letterId);

		this.handleWords();

		this.eventBus.emit(EVENTS.UPDATE_TURN_LETTERS, {
			dropppedLetters: this.state.turn?.droppedLetters,
			sessions: this.sessions,
		});
		this.eventBus.emit(EVENTS.UPDATE_TURN_FIELD, { field: this.state.field, sessions: this.sessions });
	}

	public removeLetter({ letterId }: IRemoveLetter) {
		const droppedLetter = this.state.turn?.droppedLetters.indexOf(letterId);

		if (typeof droppedLetter === 'number' && droppedLetter !== -1) {
			this.state.turn?.droppedLetters.splice(droppedLetter, 1);
		}

		this.state.field.forEach((row, rowIndex) => {
			row.forEach((cellContent, cellIndex) => {
				if (cellContent?.letterId === letterId) {
					const schema = generateFieldSchema();
					this.state.field[rowIndex][cellIndex] = {
						bonus: schema[rowIndex][cellIndex].bonus,
						letterId: null,
					};
				}
			});
		});

		this.letters.clearNeighbours(letterId);

		this.handleWords();

		this.eventBus.emit(EVENTS.UPDATE_TURN_LETTERS, {
			dropppedLetters: this.state.turn?.droppedLetters,
			sessions: this.sessions,
		});
		this.eventBus.emit(EVENTS.UPDATE_TURN_FIELD, { field: this.state.field, sessions: this.sessions });
	}

	private placeWordOnTheField(word: string) {
		const position = {
			x: 4,
			y: 7,
		};
		const newLetters: Letters = {};

		for (let i = 0; i < word.length; i++) {
			const wordLetter = word[i].toUpperCase();
			const letter = this.letters.getLetterByValue(wordLetter, 'stock');

			if (letter) {
				this.letters.putInDeck('field', letter.id, {
					x: position.x + i,
					y: position.y,
				});
				newLetters[letter.id] = letter;
				this.state.field[position.y][position.x + i].letterId = letter.id;
			}
		}

		return newLetters;
	}

	public changeLetters(letters: string[]) {
		const activePlayer = this.state.players[this.state.activePlayer];

		letters.forEach((letterId) => {
			if (activePlayer.letters.includes(letterId)) {
				this.letters.putInDeck('stock', letterId);
				activePlayer.letters.splice(activePlayer.letters.indexOf(letterId), 1);
			}
		});
		this.letters.shuffle();
		activePlayer.letters.push(
			...this.letters.getRandomLetters(letters.length),
		);

		// clear all field letters that were put during the current turn
		if (this.state.turn?.droppedLetters && this.state.turn?.droppedLetters.length) {
			this.state.turn.droppedLetters.forEach((letterId) => {
				this.state.field.forEach((fieldRow, y) => {
					fieldRow.forEach((fieldCell, x) => {
						if (fieldCell.letterId === letterId) {
							this.state.field[y][x] = this.initialField[y][x];
						}
					});
				});
			});

			this.eventBus.emit(EVENTS.UPDATE_TURN_FIELD, { field: this.state.field, sessions: this.sessions });
		}

		// just in case clear all current's turn data
		this.state.turn = {
			droppedLetters: [],
			words: [],
		};

		// force new turn
		this.nextTurn();
	}

	public nextTurn() {
		const playerLetters = this.state.players[this.state.activePlayer].letters;
		const letters =
			this.state.turn?.droppedLetters && this.letters.getRandomLetters(this.state.turn?.droppedLetters.length);
		// mark new letters that were put out the stock
		// this.state.letters = this.letters.getLetters(); // ###

		// give new letters for the current player
		this.state.turn?.droppedLetters.forEach((dropppedLetter) => {
			const dropppedPlayerLetter = playerLetters.indexOf(dropppedLetter);

			const newLetter = letters && letters.pop();

			if (newLetter) {
				this.state.players[this.state.activePlayer].letters.splice(dropppedPlayerLetter, 1, newLetter);
			}
		});

		// calculate new score for the current player
		const score = this.state.turn?.words.reduce<number>((acc, word) => acc + (word.score ?? 0), 0);

		this.state.players[this.state.activePlayer].score += score || 0;

		// switch to the next player
		const players = Object.keys(this.state.players);
		const currentPlayerIndex = players.indexOf(this.state.activePlayer);

		if (currentPlayerIndex === players.length) {
			[this.state.activePlayer] = players;
		}

		this.previousTurnWords = this.state.turn?.words || [];
		this.allWords = this.allWords.concat(this.previousTurnWords);

		this.state.turn?.words.forEach((word) => {
			word.letterIds.forEach((letterId) => {
				const currentLetter = this.letters.getLetter(letterId);

				if (currentLetter && this.state.letters) {
					this.state.letters[letterId] = currentLetter;
				}

				this.letters.clearNeighbours(letterId);
			});
		});

		this.state.turn = {
			droppedLetters: [],
			words: [],
		};

		this.timer.stop();

		this.eventBus.emit(EVENTS.UPDATE_PLAYERS, { players: this.state.players, sessions: this.sessions });

		this.calculateVisibleLetters(this.state.activePlayer);
		this.eventBus.emit(EVENTS.UPDATE_LETTERS, { letters: this.state.allVisibleLettersMap, sessions: this.sessions }); // ###
		// this.eventBus.emit(EVENTS.UPDATE_LETTERS, { letters: this.state.letters, sessions: this.sessions }); // ###

		this.eventBus.emit(EVENTS.UPDATE_TURN_LETTERS, {
			dropppedLetters: this.state.turn?.droppedLetters,
			sessions: this.sessions,
		});
		this.eventBus.emit(EVENTS.UPDATE_TURN_WORDS, {
			words: this.previousTurnWords.map((word) => ({ ...word, isPrevious: true })),
			sessions: this.sessions,
		});

		// set new timer
		this.timer = new Timer(DEFAULT_TIMER_VALUE_SEC, this.onTimerTick, this.onTimerEnd);
		this.timer.start();
	}

	public onTimerTick = (time: number, total: number) => {
		this.eventBus.emit(EVENTS.ON_TIMER_TICK, { gameId: this.id, data: { time, total }, sessions: this.sessions });
	};

	public onTimerEnd = () => {
		// clear all field letters that were put during the current turn
		if (this.state.turn?.droppedLetters && this.state.turn?.droppedLetters.length) {
			this.state.turn.droppedLetters.forEach((letterId) => {
				this.state.field.forEach((fieldRow, y) => {
					fieldRow.forEach((fieldCell, x) => {
						if (fieldCell.letterId === letterId) {
							this.state.field[y][x] = this.initialField[y][x];
						}
					});
				});
			});

			this.eventBus.emit(EVENTS.UPDATE_TURN_FIELD, { field: this.state.field, sessions: this.sessions });
		}

		// just in case clear all current's turn data
		this.state.turn = {
			droppedLetters: [],
			words: [],
		};

		this.nextTurn();
	};

	public getState() {
		return this.state;
	}

	public finish(player?: IPlayer) {
		this.eventBus.emit(EVENTS.ON_FINISH_GAME, {
			gameId: this.id,
			data: { winner: { name: player?.name, score: player?.score } },
			sessions: this.sessions,
		});
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
