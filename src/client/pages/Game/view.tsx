import * as React from 'react';
import { createPortal } from 'react-dom';
import { h32 } from 'xxhashjs';
import { DndContext, MouseSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, UniqueIdentifier } from '@dnd-kit/core';
import type { IProps as ICellProps } from '../../components/Cell/view';
import type { IGameState, UserId, IWords } from '../../../types';
import { PLAYER_DEFAULT_LETTERS_COUNT } from '../../../constants';
import Sidebar from '../../components/Sidebar';
import Field from '../../components/Field';
import DroppableCell from '../../components/DroppableCell';
import DraggableLetter from '../../components/DraggableLetter';
import Letter from '../../components/Letter';
// import schema from '../schema.json';
import Button from '../../components/Button';

const FIELD_POSITION_START_X = 59;
const FIELD_POSITION_START_Y = 9;

const LETTERS_POSITION_START_X = 727;
const LETTERS_POSITION_START_Y = 89;

const LETTER_WIDTH = 40;

const calculatePosition = (start: number, offset: number) => start + LETTER_WIDTH * offset + offset;

export interface IProps {
	classes: Record<string, string>;
	game: IGameState | null;
	userId: UserId;
	field: any;
	fieldLetters: string[];
	onCreateGame: () => void;
	onAddLetter: (payload: { letterId: string, position: { x: number; y: number }, cellId: UniqueIdentifier }) => void;
	onRemoveLetter: (payload: { letterId: string }) => void;
}

function GamePage({ game, field, fieldLetters, onCreateGame, userId, classes, onAddLetter, onRemoveLetter }: IProps) {
	const [selectedLetters, setSelectedLetters] = React.useState<string[]>([]);
	const [words, updateWords] = React.useState<IWords>({});

	const mouseSensor = useSensor(MouseSensor, {
		activationConstraint: {
			distance: 10,
		},
	});

	const sensors = useSensors(mouseSensor);

	// @TODO: вынести на сервер
	const makeWord = (letterId: string, startPosition: { x: number; y: number }, axis: 'y' | 'x') => {
		const letters = [letterId];
		const topLimit = 0;
		const bottomLimit = field.length - 1;
		let wordStartPosition = `${startPosition.x};${startPosition.y}`;
		let up = startPosition[axis] > topLimit;

		const result: IWords = {};

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
			}
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

		walk(startPosition);

		if (letters.length > 1) {
			const wordId = letters.join(';');

			result[wordId] = {
				start: wordStartPosition,
				letterIds: letters,
				kind: axis === 'y' ? 'vertical' : 'horizontal'
			}
		}

		console.log('-----makeWord------', result);

		return result;
	}
	// @TODO: вынести на сервер
	const makeNewWords = (letterId: string, position: { x: number; y: number }) => {
		const verticalWord = makeWord(letterId, position, 'y');
		const horizontalWord = makeWord(letterId, position, 'x');
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
	// @TODO: вынести на сервер
	const updateCurrentWords = (data: IWords, letterId: string, position: { x: number; y: number }) => {
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
	// @TODO: вынести на сервер
	const generateWords = (items: Map<string, any>) => {
		const data: IWords = [...items.keys()].reduce((acc, droppedLetterId) => {
			const letter = items.get(droppedLetterId);

			if (Object.keys(acc).length) {
				const { changedWords } = updateCurrentWords(acc, droppedLetterId, letter.position);
				const newWords = makeNewWords(droppedLetterId, letter.position);
				acc = { ...changedWords, ...newWords };
			} else {
				const newWords = makeNewWords(droppedLetterId, letter.position);
				acc = { ...newWords };
			}

			return acc;
		}, {});

		return data;

	}

	const toogleSelected = (id: string) => {
		if (!fieldLetters.includes(id)) {
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
	}

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

	const handleRightClick = (id: string, e: React.SyntheticEvent) => {
		e.preventDefault();

		if (fieldLetters.includes(id)) {
			onRemoveLetter({ letterId: id });
		} else {
			toogleSelected(id);
		}
	};

	const handleDragEnd = ({ over, active }: DragEndEvent) => {
		const letterId = active.id as string;
		const letter = game!.letters[letterId];

		if (over) {
			let prevPosition: { x: number; y: number };
			if (letter.located.in === 'field') {
				prevPosition = { ...letter.located.position };
			}

			const { position } = over.data.current as any;

			letter.located = {
				in: 'field',
				position,
			};

			onAddLetter({ letterId, position, cellId: over.id });
		} else {
			onRemoveLetter({letterId: active.id as string});
		}
	};

	const renderPlayerLetters = () => {
		const playerLetters = game?.players[userId].letters;

		// МЕНЯЕМ ПОЗИЦИЮ БУКВЫ В ЗАВИСИМОСТИ ОТ ТОГО, БЫЛА ОНА ПЕРЕМЕЩЕНА В ТЕКУЩЕМ ХОЖУ ИЛИ НЕТ

		return (
			<div className={classes.lettersContainer}>
				{playerLetters?.map((letterId, i) => {
					const posLeft = calculatePosition(LETTERS_POSITION_START_X, i);

					console.log('-----PLAYER LETTER ID-------', letterId);
					if (fieldLetters.includes(letterId)) {
						return null;
					}

					return (
						<DraggableLetter
							key={h32(letterId, 0xabcd).toString()}
							styles={{
								top: LETTERS_POSITION_START_Y,
								left: posLeft,
							}}
							isSelected={selectedLetters.includes(letterId)}
							letterId={letterId}
							onClick={() => toogleSelected(letterId)}
							onRightClick={(e: any) => handleRightClick(letterId, e)}
							onDoubleClick={() => { onRemoveLetter({ letterId }) }}
						/>
					);
				})}
			</div>
		);
	}

	if (!game) {
		return (
			// [DEBUG] this is for debug only
			<div className={classes.newGameContainer}>
				<Button onClick={onCreateGame}>New game</Button>
			</div>
		);
	}


	const renderLetter = (letterId: string) => {
		const letter = game?.letters[letterId] as unknown as any;
		// return null;

		console.log('--fieldLetters-----', fieldLetters, letterId);

		if (fieldLetters.includes(letterId)) {
			return (
				<DraggableLetter
					key={h32(letterId, 0xabcd).toString()}
					isSelected={selectedLetters.includes(letterId)}
					letterId={letterId}
					onClick={() => toogleSelected(letterId)}
					onRightClick={(e: any) => handleRightClick(letterId, e)}
				/>
				
			)
		}

		return (
			<Letter
				key={h32(letterId, 0xabcd).toString()}
				letterId={letterId}
			/>
		);
	}

	console.log('----RERENDER-----');

	const renderFieldLetter = () => {
		// меняем позицию у нужной буквы?
	}

	return (
		<div className={classes.game}>
			<DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} sensors={sensors}>
				<Field>
					{(field as ICellProps['bonus'][][]).map((row, index) => (
						<div
							key={h32(`${JSON.stringify(row) + index}row`, 0xabcd).toString()}
							style={{ width: '614px', gap: '1px', display: 'flex', margin: 0 }}
						>
							{row.map((value, i) => {
								const id = i.toString() + index.toString();
								const position = {
									x: i,
									y: index,
								};

								const isLetterId = value && (!isNaN(Number(value)));
								const isDisabledCell = !!(isLetterId && fieldLetters.includes(value));
								
								return (
									<DroppableCell
										id={id}
										// @TODO: переделать
										disabled={isDisabledCell}
										position={position}
										key={h32(`${(value && !isLetterId ? value : '') + id}dr-cell`, 0xabcd).toString()}
										bonus={value && !isLetterId ? value : null}
									>
										{isLetterId && renderLetter(value as unknown as string)}
									</DroppableCell>
								);
							})}
						</div>
					))}
				</Field>
				<Sidebar />
				{createPortal(renderPlayerLetters(), document.body)}
				{/* {createPortal(renderFieldLetters, document.body)} */}
			</DndContext>
		</div>
	);
}

GamePage.displayName = 'GamePage';

export default GamePage;
