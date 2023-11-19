import * as React from 'react';
import { h32 } from 'xxhashjs';
import Field from '../Field';
import Cell from '../Cell';
import Timer from '../TurnTimer';
import Button from '../Button';
import DraggableLetter from '../DraggableLetter';
import { PLAYER_DEFAULT_LETTERS_COUNT } from '../../../constants';

export interface IProps {}

export interface IEncapsulatedProps extends IProps {
	classes: Record<string, string>;
}

function SidebarView({ classes }: IEncapsulatedProps) {
	return (
		<div className={classes.sidebar}>
			<Timer seconds={120} remainSeconds={0} />
			<Field className={classes.field}>
				{new Array(PLAYER_DEFAULT_LETTERS_COUNT).fill(null).map((_, i) => {

					return (
						<Cell key={i} bonus={null}>
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
