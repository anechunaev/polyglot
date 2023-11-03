import * as React from 'react';
import type { IProps as IViewProps } from './view';
import { EventBus } from '../../services/eventBus';
import { EVENTS } from '../../../constants';

export interface IProps {}

function Model(View: React.ComponentType<IViewProps>): React.ComponentType<IProps> {
    return function GameListModel(_props: IProps) {
        const [gameList, updateGameList] = React.useState<string[]>(() => []);
        const [timer, setTimer] = React.useState<{time?: number; total?: number;}>({});
        const eventBus = new EventBus();

        eventBus.connect();

        eventBus.on(EVENTS.CREATE_GAME, (payload: any) => {
            console.log("New game was created with state", payload);
        });

        eventBus.on(EVENTS.UPDATE_GAME_LIST, (payload: string[]) => {
            updateGameList(() => payload);
        });

        eventBus.on(EVENTS.ON_TIMER_TICK, (payload: any) => {
            setTimer(() => payload);
            console.log('---ON_TIMER_TICK-----', payload);
        });

        const onStartGame = React.useCallback((gameId: string) => {
            eventBus.emit(EVENTS.GAME_START, { gameId });
        }, []);

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
        }, []);

        return (
            <View
                onStartGame={onStartGame}
                onCreateGame={onCreateGame}
                gameList={gameList}
                timer={{remainMs: timer.time!, ms: timer.total!}}
            />
        );
    };
}

export default Model;
