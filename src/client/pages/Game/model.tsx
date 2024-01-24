import * as React from 'react';
import { EVENTS } from '../../../constants';
import type { IProps as IViewProps } from './view';
import type { IGameState , GameId, IUser} from '../../../types';


export interface IProps {
    eventBus: any;
}

function Model(View: React.ComponentType<Omit<IViewProps, "classes">>): React.ComponentType<IProps> {
    function GameModel({eventBus}: IProps) {
        const [gameId, updateGameId] = React.useState<GameId>();
        const [user, setUser] = React.useState<IUser | null>(null);
        const [gameState, updateGameState] = React.useState<IGameState | null>(null);

        React.useEffect(() => {
            eventBus.emit(EVENTS.GET_CURRENT_USER);
        }, []);

        eventBus.on(EVENTS.CREATE_GAME, React.useCallback((payload: any) => {
            // eslint-disable-next-line no-console

            const data = JSON.parse(payload);
            updateGameId(data.gameId);

            updateGameState(() => ({...data.game}));

            console.log('New game was created with state', data);
        }, [gameState]));

        eventBus.on(EVENTS.GET_CURRENT_USER, React.useCallback((payload: IUser) => {
            // @TODO: need to check it
            console.log('---------CLIENT GOT USER INFO------', payload);
            setUser(() => (payload));
        }, [user]));

        const onCreateGame = () => {
            eventBus.emit(EVENTS.CREATE_GAME, {
                settings: {
                    max_players: 2
                },
                user
            });
        }

        console.log('---RERENDER without user ---')

        if (!user) {
            return null;
        }

        console.log('---RERENDER ---')
        return <View game={gameState} userId={user!.id} onCreateGame={onCreateGame} />
    }

    GameModel.displayName = "GameModel";
    GameModel.defaultProps = {
    };

    return GameModel;
}

export default Model;
