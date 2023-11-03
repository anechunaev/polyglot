import * as React from 'react';
import Button from '../Button';
import Timer from '../TurnTimer';

export interface IProps {
    timer: {
        remainSeconds: number;
        seconds: number;
    }
    onCreateGame: () => void;
    onNextTurn: (gameId: string) => void;
    onStartGame: (gameId: string) => void;
    gameList: string[];
}

export interface IEncapsulatedProps extends IProps {
	classes: Record<string, string>;
}

function View(props: IEncapsulatedProps) {
    return (
        <div>
            <Button
                onClick={props.onCreateGame}
            >
                Create a Game
            </Button>
            <br />
            {props.gameList.map(gameId => {
                return (
                    <div key={gameId}>
                        <Timer {...props.timer} />
                        <span>{gameId} </span>
                        <Button onClick={() => props.onStartGame(gameId)}>Start </Button>
                    </div>
                );
            })}
        </div>
    );
}

export default View;
