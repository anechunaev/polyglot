import * as React from 'react';
import { createPortal } from 'react-dom';
import { DndContext, MouseSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, UniqueIdentifier } from '@dnd-kit/core';
import type { IGameState, UserId, IWord } from '../../../types';
import Sidebar from '../../components/Sidebar';
import GameField from '../../components/GameField';
import PlayerLetters from '../../components/PlayerLetters';
import Button from '../../components/Button';


export interface IProps {
	classes: Record<string, string>;
	game: IGameState | null;
	userId: UserId;
	fieldLetters: string[];
	onNextTurn: () => void;
	onCreateGame: () => void;
	onAddLetter: (payload: { letterId: string, position: { x: number; y: number }, cellId: UniqueIdentifier }) => void;
	onRemoveLetter: (payload: { letterId: string }) => void;
}

function GamePage({ game, fieldLetters, onCreateGame, userId, classes, onAddLetter, onRemoveLetter, onNextTurn }: IProps) {
	const [selectedLetters, setSelectedLetters] = React.useState<string[]>([]);

	const mouseSensor = useSensor(MouseSensor, {
		activationConstraint: {
			distance: 10,
		},
	});

	const sensors = useSensors(mouseSensor);

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
				<GameField fieldLetters={fieldLetters} />
				<Sidebar onNextTurn={onNextTurn} />
				{createPortal(<PlayerLetters selectedLetters={selectedLetters} setSelectedLetters={setSelectedLetters} fieldLetters={fieldLetters} onRemoveLetter={onRemoveLetter} />, document.body)}
			</DndContext>
		</div>
	);
}

GamePage.displayName = 'GamePage';

export default GamePage;
