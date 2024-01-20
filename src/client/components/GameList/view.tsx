import * as React from 'react';
import Button from '../Button';
import Timer from '../TurnTimer';

export interface IProps {
    timer: {
        remainSeconds: number;
        seconds: number;
    }
    onCreateGame: () => void;
    onNextTurn: (gameId: string, playerId: string) => void;
    onStartGame: (gameId: string) => void;
    gameList: string[];
    gameId: string;
    playerId: string;
}

export interface IEncapsulatedProps extends IProps {
	classes: Record<string, string>;
}

function View(props: IEncapsulatedProps) {
    return (
	<div className={props.classes.game}>
		<Button
			onClick={props.onCreateGame}
            >
			Create a Game
		</Button>
		<br />
		{props.gameList.map(gameId => (
			<div key={gameId}>
				<Timer {...props.timer} />
				<span>{gameId} </span>
				<Button onClick={() => props.onStartGame(gameId)}>Start </Button>
				<Button onClick={() => props.onNextTurn(props.gameId, props.playerId)}>Next turn </Button>
			</div>
                ))}
	</div>
    );
}

View.displayName = 'Test integration';

export default View;
