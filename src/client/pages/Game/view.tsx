import * as React from 'react';
import { createPortal } from 'react-dom';
import { h32 } from 'xxhashjs';
import { DndContext, MouseSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, UniqueIdentifier } from '@dnd-kit/core';
import type { IProps as ICellProps } from '../../components/Cell/view';
import type { IGameState, UserId, IWords, Field as IField } from '../../../types';
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

			if (fieldLetters.includes(letterId)) {
				onRemoveLetter({letterId});
			}

			onAddLetter({ letterId, position, cellId: over.id });
		} else {
			onRemoveLetter({letterId: active.id as string});
		}
	};

	const renderPlayerLetters = () => {
		const playerLetters = game?.players[userId].letters;

		return (
			<div className={classes.lettersContainer}>
				{playerLetters?.map((letterId, i) => {
					const posLeft = calculatePosition(LETTERS_POSITION_START_X, i);

					const position: {top: number, left: number} = {
						top: LETTERS_POSITION_START_Y,
						left: posLeft,
					};

					if (fieldLetters.includes(letterId)) {
						(field as IField).forEach((row, rowIndex) => {
							row.forEach((cell, cellIndex) => {
								if (cell === letterId) {
									position.top = calculatePosition(FIELD_POSITION_START_Y, rowIndex);
									position.left = calculatePosition(FIELD_POSITION_START_X, cellIndex);
								}
							});
						})
					}

					return (
						<DraggableLetter
							key={h32(letterId, 0xabcd).toString()}
							styles={{
								top: position.top,
								left: position.left,
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

		if (fieldLetters.includes(letterId)) {
			return null;
		}

		return (
			<Letter
				key={h32(letterId, 0xabcd).toString()}
				letterId={letterId}
			/>
		);
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
