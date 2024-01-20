import * as React from 'react';
import type { IProps as IViewProps } from './view';
import { EventBus } from '../../services/eventBus';
import { EVENTS } from '../../../constants';

export interface IProps { }

// export interface IGameState {
//     active_player: UserId;
//     players: {
//         [playerId: string]: IPlayer
//     };
//     spectators: IUser[];
//     letters: Letters;
//     field: Field
//     timer: {
//         time: number;
//         total: number;
//     };
// }

function Model(View: React.ComponentType<IViewProps>): React.ComponentType<IProps> {
    return function GameListModel(_props: IProps) {
        const [gameList, updateGameList] = React.useState<string[]>(() => []);
        const [gameId, updateGameId] = React.useState<string>();
        const [gameState, updateGameState] = React.useState<IGameState>();
        const [timer, setTimer] = React.useState<{ time?: number; total?: number; }>({});
        const eventBus = new EventBus();

        eventBus.connect();

        eventBus.on(EVENTS.CREATE_GAME, (payload: any) => {
            // eslint-disable-next-line no-console
            updateGameId(payload.gameId);
            updateGameState({...payload.game});
            console.log('New game was created with state', payload);
        });

        eventBus.on(EVENTS.UPDATE_GAME_LIST, (payload: string[]) => {
            updateGameList(() => payload);
        });

        eventBus.on(EVENTS.ON_TIMER_TICK, (payload: any) => {
            setTimer(() => payload);
        });

        eventBus.on(EVENTS.ON_NEXT_TURN, (payload: any) => {
            console.log('----EVENTS.ON_NEXT_TURN------', payload);
        });

        const onStartGame = React.useCallback((gameId: string) => {
            eventBus.emit(EVENTS.GAME_START, { gameId });
        }, [eventBus]);

        const onCreateGame = React.useCallback(() => {
            eventBus.emit(EVENTS.CREATE_GAME, {
                game: {
                    settings: {
                        max_players: 2
                    },
                    player: {
                        name: "jpig"
                    }
                }
            });
        }, [eventBus]);

        const onNextTurn = React.useCallback((gameId: string, playerId: string) => {
            eventBus.emit(EVENTS.ON_NEXT_TURN, {
                gameId,
                turn: {
                    words: [{
                        type: 'horizontal',
                        position: {
                            y: 1,
                            x: 9
                        },
                        letters: ["126", "37", "121", "69", "15"]
                    }],
                    playerId
                }
            })
        }, []);

        return (
	<View
		gameId={gameId!}
		playerId={gameState?.active_player!}
		onStartGame={onStartGame}
		onNextTurn={onNextTurn}
		onCreateGame={onCreateGame}
		gameList={gameList}
		timer={{ remainSeconds: timer.time!, seconds: timer.total! }}
            />
        );
    };
}

export default Model;
