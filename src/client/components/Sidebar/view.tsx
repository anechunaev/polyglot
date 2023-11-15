import * as React from 'react';
import { h32 } from 'xxhashjs';
import Field from '../Field';
import Cell from '../Cell';
import Timer from '../TurnTimer';
import Button from '../Button';
import DraggableLetter from '../DraggableLetter';
import { PLAYER_DEFAULT_LETTERS_COUNT } from '../../../constants';

export interface IProps {
	letterIds: (string | null)[];
	onClick: (id: number) => void;
	selectedLetters: number[];
}

export interface IEncapsulatedProps extends IProps {
	classes: Record<string, string>;
}

function SidebarView({ classes, letterIds, selectedLetters, onClick }: IEncapsulatedProps) {
	return (
		<div className={classes.sidebar}>
			<Timer seconds={120} remainSeconds={0} />
			<Field className={classes.field}>
				{new Array(PLAYER_DEFAULT_LETTERS_COUNT).fill(null).map((_, i) => {
					const letterId = letterIds[i];

					return (
						<Cell key={i} bonus={null}>
							{letterId && (
								<DraggableLetter
									key={h32(letterId, 0xabcd).toString()}
									letterId={letterId}
									onClick={() => onClick(i)}
									classes={
										{ letter: classes.letter }
									}
									isSelected={selectedLetters.includes(i)}
								/>
							)}
						</Cell>
					);
				})}
			</Field>
			<div className={classes.buttons}>
				<Button className={classes.button} onClick={() => { }}>
					Замена букв
				</Button>
				<Button className={classes.button} onClick={() => { }}>
					Завершить ход
				</Button>
			</div>
		</div>
	);
}

SidebarView.displayName = 'SidebarView';

export default SidebarView;
