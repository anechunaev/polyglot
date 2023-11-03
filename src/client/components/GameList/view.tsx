import * as React from 'react';
import Button from '../Button';

export interface IProps {
	onCreateGame: () => void;
	gameList: string[];
}

export interface IEncapsulatedProps extends IProps {
	classes: Record<string, string>;
}

function View(props: IEncapsulatedProps) {
	return (
		<div className={props.classes.container}>
			<Button onClick={props.onCreateGame}>Create Game</Button>
			<Button disabled onClick={props.onCreateGame}>
				Disabled button without hover, doesn&quot;t create a game
			</Button>
			<br />
			{props.gameList.map((gameId) => (
				<p key={gameId}>{gameId}</p>
			))}
		</div>
	);
}

export default View;
