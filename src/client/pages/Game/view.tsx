import * as React from 'react';
import { createPortal } from 'react-dom';
import { h32 } from 'xxhashjs';
import { DndContext, MouseSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { IProps as ICellProps } from '../../components/Cell/view';
import type { IGameState, UserId, IWords } from '../../../types';
import Sidebar from '../../components/Sidebar';
import Field from '../../components/Field';
import DroppableCell from '../../components/DroppableCell';
import DraggableLetter from '../../components/DraggableLetter';
import Letter from '../../components/Letter';
import schema from '../schema.json';
import Button from '../../components/Button';

const FIELD_POSITION_START_X = 59;
const FIELD_POSITION_START_Y = 9;

const LETTERS_POSITION_START_X = 727;
const LETTERS_POSITION_START_Y = 73;

const LETTER_WIDTH = 40;

const calculatePosition = (start: number, offset: number) => start + LETTER_WIDTH * offset + offset;

export interface IProps {
	classes: Record<string, string>;
	game: IGameState | null;
	userId: UserId;
	onCreateGame: () => void;
}

function GamePage({ game, onCreateGame, userId, classes }: IProps) {
	const [droppedLetters, dropLetters] = React.useState<Record<string, any>>({});
	const [selectedLetters, setSelectedLetters] = React.useState<string[]>([]);
	const [field, updateField] = React.useState<(string | null)[][]>([[]]);
	const [words, updateWords] = React.useState<IWords>({});

	const mouseSensor = useSensor(MouseSensor, {
		activationConstraint: {
			distance: 10,
		},
	});

	const sensors = useSensors(mouseSensor);

	const makeWord = (letterId: string, startPosition: { x: number; y: number }, axis: 'y' | 'x') => {
		const letters = [letterId];
		const topLimit = 0;
		const bottomLimit = field.length - 1;
		let wordStartPosition = `${startPosition.x};${startPosition.y}`;
		let up = startPosition[axis] > topLimit;

		let result: IWords = {};

		const walk = (pos: { x: number; y: number }): any => {
			const position = { ...pos };
			if (up) {
				--position[axis];

				const data = field[position.y][position.x];
				const isLetter = data && !isNaN(Number(data));

				if (!isLetter) {
					up = false;
					return walk(startPosition);
				}

				wordStartPosition = `${position.x};${position.y}`;
				letters.unshift(data);

				return walk(position);
			} else {
				if (position[axis] === bottomLimit) {
					return;
				}

				++position[axis];

				const data = field[position.y][position.x];
				const isLetter = data && !isNaN(Number(data));

				if (!isLetter) {
					return;
				}

				letters.push(data);
				return walk(position);
			}
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

	const makeNewWords = (letterId: string, position: { x: number; y: number }) => {
		const verticalWord = makeWord(letterId, position, 'y');
		const horizontalWord = makeWord(letterId, position, 'x');
		let response: IWords = {};

		if (!Object.keys(verticalWord).length && !Object.keys(horizontalWord).length) {
			const wordId = [letterId].join(';');

			response[wordId] = {
				start: `${position.x};${position.y}`,
				letterIds: [letterId],
				kind: 'vertical'
			}
		}

		if (Object.keys(verticalWord).length) {
			response = {...response, ...verticalWord};
			// newWords.push(verticalWord);
		}

		if (Object.keys(horizontalWord).length) {
			response = {...response, ...horizontalWord};
			// newWords.push(horizontalWord);
		}

		return response;
	}
	const updateCurrentWords = (letterId: string, position: { x: number; y: number }) => {
		const newLetterPosition = `${position.x};${position.y}`;
		let wereUpdated =  false;

		const newWords = Object.keys(words).reduce<IWords>((acc, wordId) => {
			const word = words[wordId];
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

				wereUpdated = true;
				delete acc[wordId];
				const newId = newWord.letterIds.join(';');

				acc[newId] = newWord;
			} else {

			acc[wordId] = newWord;
			}

			return acc;
		}, {});

		return {changedWords: newWords, wereUpdated: wereUpdated};
	 }

	const generateWords = (letterId: string, position: { x: number; y: number }) => {
		if (Object.keys(words).length) {
			let result: IWords = {};
			const {changedWords, wereUpdated} = updateCurrentWords(letterId, position);
			const newWords = makeNewWords(letterId, position);

			result = {...changedWords, ...newWords};

			updateWords(() => ({...result}));
		} else {

			const newWords = makeNewWords(letterId, position);
			updateWords(state => ({...state, ...newWords}));
		}
	}

	const toogleSelected = React.useCallback(
		(id: string) => {
			// the letter is not on the field
			if (!droppedLetters[id]?.fieldCell) {
				setSelectedLetters((state) => {
					const indexOf = state.indexOf(id);

					if (indexOf !== -1) {
						const newState = [...state];
						newState.splice(indexOf, 1);

						return newState;
					}
					return [...state, id];
				});
			}
		},
		[droppedLetters],
	);

	const handleDragStart = ({ active }: DragStartEvent) => {
		const indexOf = selectedLetters.indexOf(active.id.toString());

		if (indexOf !== -1) {
			setSelectedLetters((state) => {
				const newState = [...state];
				newState.splice(indexOf, 1);

				return newState;
			});
		}
	};

	const removeLetterFromTheWord = (letterId: string) => {
		const letter = game?.letters[letterId];

		const updatedWords = Object.keys(words).reduce<IWords>((acc, item) => {
			const keys = item.split(';');
			const index = keys.indexOf(letterId);
			if (index !== -1) {
				keys.splice(index, 1);

				acc[keys.join(';')] = {
					...words[item],
					letterIds: keys
				}
			} else {
				acc[item] = words[item];
			}

			return acc;
		}, {});

		updateWords(() => updatedWords);

		if (letter?.located.in === 'field') {
			const {position} = letter.located;


			// const fieldCellDefaultData = game!.field[position.y][position.x];

			// console.log('........fieldCellDefaultData.........', fieldCellDefaultData, position);

			const newFieldData = [...field];

			// тут нужно получить значение дефолтной ячейки, но почему-то объект состояния игры перезаписывается

			newFieldData[position.y][position.x] = null;

			updateField(() => newFieldData);

			console.log('----FIELD--------', field[position.y][position.x])

			const newWords = makeNewWords(letterId, position);

			console.log('------newWords-------', newWords);
		}
	}

	const moveLetterBackTo = React.useCallback(
		(id: string, initialPosition: { x: number; y: number }) => {
			if (droppedLetters[id]?.fieldCell) {
				dropLetters((state) => {
					const newState = { ...state };
					newState[id] = {
						fieldCell: null,
						position: {
							top: initialPosition.y,
							left: initialPosition.x,
						},
					};

					return newState;
				});

				removeLetterFromTheWord(id);
			}
		},
		[droppedLetters],
	);

	const handleRightClick = React.useCallback(
		(id: string, initialPosition: { x: number; y: number }, e: React.SyntheticEvent) => {
			e.preventDefault();

			if (droppedLetters[id]?.fieldCell) {
				moveLetterBackTo(id, initialPosition);
			} else {
				toogleSelected(id);
			}
		},
		[droppedLetters, moveLetterBackTo, toogleSelected],
	);

	const onCellClick = React.useCallback(
		(id: string, pos: { x: number; y: number }) => {
			if (selectedLetters.length) {
				const letterId = selectedLetters[0];

				dropLetters((state) => {
					const newState = { ...state };
					newState[letterId] = {
						fieldCell: id,
						position: {
							top: calculatePosition(FIELD_POSITION_START_Y, pos.y),
							left: calculatePosition(FIELD_POSITION_START_X, pos.x),
						},
					};

					return newState;
				});

				const indexOf = selectedLetters.indexOf(letterId.toString());

				setSelectedLetters((state) => {
					const newState = [...state];
					newState.splice(indexOf, 1);

					return newState;
				});
			}
		},
		[selectedLetters],
	);

	const handleDragEnd = ({ over, active }: DragEndEvent) => {
		const letterId = active.id as string;

		const letter = game!.letters[letterId];

		if (over) {
			const { position } = over.data.current as any;

			letter.located = {
				in: 'field',
				position,
			};

			dropLetters((state) => {
				const newState = { ...state };
				newState[letterId] = {
					fieldCell: over.id,
					position: {
						top: calculatePosition(FIELD_POSITION_START_Y, position.y),
						left: calculatePosition(FIELD_POSITION_START_X, position.x),
					},
				};

				return newState;
			});

			updateField(field => {
				field[position.y][position.x] = letterId;

				return field;
			})

			generateWords(letterId, position);
		} else {
			const { initialPosition } = active.data.current as any;
			letter.located.in = 'player';
			moveLetterBackTo(letterId, initialPosition);
		}
	};

	const updateFieldState = (lettersSet: Record<string, string>) => {
		let field = [...game!.field];

		for (let y = 0; y < game!.field.length; y++) {
			for (let x = 0; x < game!.field[y].length; x++) {

				const pos = `${x};${y}`;

				const letter = lettersSet[pos];

				if (letter) {
					field[y][x] = letter;
				}
			}
		}

		updateField(field);
	}

	const renderFieldLetters = React.useMemo(() => {
		const fieldLetters = Object.keys((game?.letters || [])).filter(letterId => game?.letters[letterId].located.in === 'field');

		const lettersPositionSet = fieldLetters.reduce<Record<string, string>>((acc, letterId) => {
			const letter = game?.letters[letterId] as unknown as any;
			const position = `${letter.located.position.x};${letter.located.position.y}`;

			acc[position] = letterId;

			return acc;

		}, {});

		if (Object.keys(lettersPositionSet).length) {
			updateFieldState(lettersPositionSet);
		}

		return (
			<div>
				{fieldLetters?.map((letterId, i) => {
					const letter = game?.letters[letterId] as unknown as any;
					return (
						<Letter
							key={h32(letterId, 0xabcd).toString()}
							letters={game?.letters}
							position={{
								top: calculatePosition(FIELD_POSITION_START_Y, letter.located.position.y),
								left: calculatePosition(FIELD_POSITION_START_X, letter.located.position.x),
							}}
							letterId={letterId}
						/>
					);
				})}
			</div>
		);
	}, [game])

	const renderPlayerLetters = React.useMemo(() => {
		const playerLetters = game?.players[userId].letters;


		return (
			<div className={classes.lettersContainer}>
				{playerLetters?.map((letterId, i) => {
					const droppedLetterPosition = droppedLetters[letterId]?.position;
					const posLeft = calculatePosition(LETTERS_POSITION_START_X, i);

					const initialPosition = {
						y: LETTERS_POSITION_START_Y,
						x: posLeft,
					};
					return (
						<DraggableLetter
							key={h32(letterId, 0xabcd).toString()}
							styles={{
								top: droppedLetterPosition ? droppedLetterPosition.top : LETTERS_POSITION_START_Y,
								left: droppedLetterPosition ? droppedLetterPosition.left : posLeft,
							}}
							initialPosition={initialPosition}
							letters={game?.letters}
							isSelected={selectedLetters.includes(letterId)}
							letterId={letterId}
							onClick={() => toogleSelected(letterId)}
							onRightClick={(e: any) => handleRightClick(letterId, initialPosition, e)}
							onDoubleClick={() => moveLetterBackTo(letterId, initialPosition)}
						/>
					);
				})}
			</div>
		);
	}, [
		droppedLetters,
		game,
		classes.lettersContainer,
		selectedLetters,
		userId,
		handleRightClick,
		moveLetterBackTo,
		toogleSelected,
	]);

	if (!game) {
		return (
			// [DEBUG] this is for debug only
			<div className={classes.newGameContainer}>
				<Button onClick={onCreateGame}>New game</Button>
			</div>
		);
	}

	// DEBUG
	const lines = Object.keys(words).map(wordId => {
		const {letterIds} = words[wordId];

		const line = letterIds.map(letterId => {
			return game?.letters[letterId].value;
		}).join('');

		return line;
	})

	console.log('-----LINES----', lines);

	return (
		<div className={classes.game}>
			<DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} sensors={sensors}>
				<Field>
					{(schema as ICellProps['bonus'][][]).map((row, index) => (
						<div
							key={h32(`${JSON.stringify(row) + index}row`, 0xabcd).toString()}
							style={{ width: '614px', gap: '1px', display: 'flex', margin: 0 }}
						>
							{row.map((bonus, i) => {
								const id = i.toString() + index.toString();
								const position = {
									x: i,
									y: index,
								};
								return (
									<DroppableCell
										id={id}
										disabled={Object.values(droppedLetters)?.some(
											(letter) => (letter as any)?.fieldCell === id,
										)}
										position={position}
										key={h32(`${(bonus || '') + id}dr-cell`, 0xabcd).toString()}
										bonus={bonus}
										onClick={() => onCellClick(id, position)}
									/>
								);
							})}
						</div>
					))}
				</Field>
				<Sidebar />
				{createPortal(renderPlayerLetters, document.body)}
				{createPortal(renderFieldLetters, document.body)}
			</DndContext>
		</div>
	);
}

GamePage.displayName = 'GamePage';

export default GamePage;
