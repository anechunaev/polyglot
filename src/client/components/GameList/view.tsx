import * as React from 'react';
import Timer from '../TurnTimer';

export interface IProps {
    timer: {
        remainMs: number;
        ms: number;
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
            <button
                onClick={props.onCreateGame}
            >
                Create Game
            </button>
            <br />
            {props.gameList.map(gameId => {
                return (
                    <div key={gameId}>
                        <Timer {...props.timer} />
                        <span>{gameId} </span>
                        <button onClick={() => props.onStartGame(gameId)}>Start </button>
                        <button onClick={() => props.onNextTurn(gameId)}>Next turn</button>
                    </div>
                );
            })}
        </div>
    );
}

export default View;
