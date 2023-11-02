import * as React from 'react';
import Greetings from './components/Greetings';
import Timer from './components/Timer';
import { EventBus } from './services/eventBus';
import { EVENTS } from '../constants';

function App() {
    const [gameList, updateGameList] = React.useState<string[]>([]);
    const eventBus = new EventBus();

    eventBus.connect();

    eventBus.on(EVENTS.CREATE_GAME, (payload: any) => {
        console.log("New game was created with state", payload);
    });

    eventBus.on(EVENTS.UPDATE_GAME_LIST, (payload: string[]) => {
        updateGameList(payload);
    });

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
        <React.StrictMode>
            <Greetings />
            <Timer
                seconds={180}
                remainSeconds={180}
            />
            <button onClick={onCreateGame}>Create Game</button>
            <br />
            {gameList.map(gameId => {
                return <div>{gameId}</div>
            })}
        </React.StrictMode>
    );
}

export default App;
