import * as React from 'react';
import uuid4 from 'uuid4';
import Field from '../Field';
import Cell from '../Cell';
import Timer from '../TurnTimer';
import Button from '../Button';
import Input from '../Input';
import Score from '../../components/Score';
import SearchIcon from './assets/search.svg';
import type { IGameState } from '../../../types';
import { PLAYER_DEFAULT_LETTERS_COUNT } from '../../../constants';

export interface IProps {
	activePlayer?: IGameState["activePlayer"];
	players: IGameState["players"]
}

export interface IEncapsulatedProps extends IProps {
	classes: Record<string, string>;
}

function SidebarView({ classes, activePlayer, players }: IEncapsulatedProps) {
	const renderActivePlayerLabel = () => {
		if (!activePlayer) {
			return null
		}

		const name = players[activePlayer].name;
		return name && <span className={classes.activePlayerLabel}>Ход игрока {name}</span>
	}

	return (
		<div className={classes.sidebar}>
			<Timer />
			{renderActivePlayerLabel()}
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
			<Score />
		</div>
	);
}

SidebarView.displayName = 'SidebarView';

export default SidebarView;
