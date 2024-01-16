import * as React from 'react';
import { createPortal } from 'react-dom';
import { h32 } from 'xxhashjs';
import { DndContext, MouseSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { IProps as ICellProps } from '../components/Cell/view';
import Sidebar from '../components/Sidebar';
import Field from '../components/Field';
import DroppableCell from '../components/DroppableCell';
import DraggableLetter from '../components/DraggableLetter';
import schema from './schema.json';
import styles from './gameStyles.scss';

import data from './data.json';

const { letters }: { letters: string[] } = (data as any).players[data.active_player];

const FIELD_POSITION_START_X = 59;
const FIELD_POSITION_START_Y = 9;

const LETTERS_POSITION_START_X = 727;
const LETTERS_POSITION_START_Y = 73;

const LETTER_WIDTH = 40;

const calculatePosition = (start: number, offset: number) => start + LETTER_WIDTH * offset + offset;

function GamePage() {
	const [fieldLetters, setFieldLetters] = React.useState<string>('{}');
	const [selectedLetters, setSelectedLetters] = React.useState<string[]>([]);

	const mouseSensor = useSensor(MouseSensor, {
		activationConstraint: {
			distance: 10,
		},
	});

	const toogleSelected = React.useCallback(
		(id: string) => {
			const droppedLetters = JSON.parse(fieldLetters);
			// the letter is not on the field
			if (!droppedLetters[id]?.parent) {
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
		[fieldLetters],
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
			const droppedLetters = JSON.parse(fieldLetters);

			if (droppedLetters[id]?.parent) {
				setFieldLetters(() => {
					droppedLetters[id] = {
						parent: null,
						position: {
							top: initialPosition.y,
							left: initialPosition.x,
						},
					};

					return JSON.stringify(droppedLetters);
				});
			}
		},
		[fieldLetters],
	);

	const handleRightClick = React.useCallback(
		(id: string, initialPosition: { x: number; y: number }, e: React.SyntheticEvent) => {
			e.preventDefault();

			const droppedLetters = JSON.parse(fieldLetters);

			if (droppedLetters[id]?.parent) {
				moveLetterBackTo(id, initialPosition);
			} else {
				toogleSelected(id);
			}
		},
		[fieldLetters, moveLetterBackTo, toogleSelected],
	);

	const onCellClick = React.useCallback(
		(id: string, pos: { x: number; y: number }) => {
			if (selectedLetters.length) {
				const letterId = selectedLetters[0];

				setFieldLetters((state) => {
					const parsedState = JSON.parse(state);
					parsedState[letterId] = {
						parent: id,
						position: {
							top: calculatePosition(FIELD_POSITION_START_Y, pos.y),
							left: calculatePosition(FIELD_POSITION_START_X, pos.x),
						},
					};

					return JSON.stringify(parsedState);
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

		if (over) {
			const { position } = over.data.current as any;

			setFieldLetters((state) => {
				const parsedState = JSON.parse(state);
				parsedState[letterId] = {
					parent: over.id,
					position: {
						top: calculatePosition(FIELD_POSITION_START_Y, position.y),
						left: calculatePosition(FIELD_POSITION_START_X, position.x),
					},
				};

				return JSON.stringify(parsedState);
			});
		} else {
			// set letter to it's initial position
			const { initialPosition } = active.data.current as any;

			moveLetterBackTo(letterId, initialPosition);
		}
	};

	const lettersContent = React.useMemo(() => {
		const droppedLetters = JSON.parse(fieldLetters);

		return (
			<div className={styles.lettersContainer}>
				{letters.map((letterId, i) => {
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
	}, [fieldLetters, selectedLetters, handleRightClick, moveLetterBackTo, toogleSelected]);

	const droppedLetters = JSON.parse(fieldLetters);

	return (
		<div className={styles.game}>
			<DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} sensors={useSensors(mouseSensor)}>
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
											(letter) => (letter as any)?.parent === id,
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
