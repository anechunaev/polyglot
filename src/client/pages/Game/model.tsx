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

        eventBus.on(EVENTS.CREATE_GAME, (payload: any) => {
            // eslint-disable-next-line no-console
            updateGameId(payload.gameId);
            updateGameState({...payload.game});
            console.log('New game was created with state', payload);
        });

        eventBus.on(EVENTS.GET_CURRENT_USER, (payload: IUser) => {
            // @TODO: need to check it
            console.log('---------CLIENT GOT USER INFO------', payload);
            setUser(payload);
        });

        const onCreateGame = () => {
            eventBus.emit(EVENTS.CREATE_GAME, {
                game: {
                    settings: {
                        max_players: 2
                    },
                    user
                }
            });
        }

        return <View game={gameState} userId={user!.id} onCreateGame={onCreateGame} />
    }

    GameModel.displayName = "GameModel";
    GameModel.defaultProps = {
    };

    return GameModel;
}

export default Model;
