import * as React from 'react';

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
			<button type="button" onClick={props.onCreateGame}>
				Create Game
			</button>
			<br />
			{props.gameList.map((gameId) => (
				<p key={gameId}>{gameId}</p>
			))}
		</div>
	);
}

export default View;
