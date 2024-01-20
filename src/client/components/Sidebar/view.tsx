import * as React from 'react';
import uuid4 from 'uuid4';
import Field from '../Field';
import Cell from '../Cell';
import Timer from '../TurnTimer';
import Button from '../Button';
import Input from '../Input';
import SearchIcon from './assets/search.svg';
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
				{new Array(PLAYER_DEFAULT_LETTERS_COUNT).fill(null).map(() => (
					<Cell key={uuid4()} bonus={null} />
				))}
			</Field>
			<div className={classes.buttons}>
				<Button className={classes.button} onClick={() => {}}>
					Замена букв
				</Button>
				<Button className={classes.button} onClick={() => {}}>
					Завершить ход
				</Button>
			</div>
			<Input
				Icon={SearchIcon}
				className={classes.searchInput}
				label="Поиск в словаре"
				onChange={() => {}}
				type="search"
			/>
		</div>
	);
}

SidebarView.displayName = 'SidebarView';

export default SidebarView;
