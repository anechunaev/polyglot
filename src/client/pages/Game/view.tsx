import * as React from 'react';
import { createPortal } from 'react-dom';
import { h32 } from 'xxhashjs';
import { DndContext, MouseSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { IProps as ICellProps } from '../../components/Cell/view';
import type { IGameState, UserId } from '../../../types';
import Sidebar from '../../components/Sidebar';
import Field from '../../components/Field';
import DroppableCell from '../../components/DroppableCell';
import DraggableLetter from '../../components/DraggableLetter';
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
	// dropped letters on the field
	const [droppedLetters, dropLetters] = React.useState<Record<string, any>>({});
	const [selectedLetters, setSelectedLetters] = React.useState<string[]>([]);
	// const [letters, setLetters] = React.useState(game?.letters);

	const mouseSensor = useSensor(MouseSensor, {
		activationConstraint: {
			distance: 10,
		},
	});

	const sensors = useSensors(mouseSensor);

	// const makeNewWords = (letter: {}) => {
	// 	console.log(letter)
	// 	// what do we suppose to do when player wants to make few words during his turn?

	// 	// start checking words
	// 		// vertical checking
	// 			// check top
	// 			// check bottom
	// 		// horizontal checking
	// 			// check left
	// 			// check right
	// }

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

			// makeNewWords();
		} else {
			const { initialPosition } = active.data.current as any;
			letter.located.in = 'player';
			moveLetterBackTo(letterId, initialPosition);
		}

		// setLetters(state => ({...state, [letterId]: letter}));
	};

	const lettersContent = React.useMemo(() => {
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

	// const lettersPosition = Object.keys(letters || {}).reduce<Record<string, LetterId>>((acc: any, letterId) => {
	// 	const letter = letters?.[letterId];

	// 	if (letter?.located.in === 'field') {
	// 		const { position } = letter.located;

	// 		acc[`${position.x};${position.y}`] = letterId;
	// 	}

	// 	return acc;
	// }, {});

	if (!game) {
		return (
			// [DEBUG] this is for debug only
			<div className={classes.newGameContainer}>
				<Button onClick={onCreateGame}>New game</Button>
			</div>
		);
	}

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
				{createPortal(lettersContent, document.body)}
			</DndContext>
		</div>
	);
}

GamePage.displayName = 'GamePage';

export default GamePage;
