import type { GameId, UserId, IGameSettings, IGame } from './GameEngine';
import type { IServiceBus } from './ServiceBus';
import { GameEngine } from './GameEngine';
import { ServiceBus } from './ServiceBus';

export interface IConnectParams {
    gameId: GameId;
    userId: UserId;
    password?: string;
};

class GameManager {
    private gameList: IGame[];
    private serviceBus: IServiceBus;

    constructor() {
        this.gameList = [];

        const serviceBus = new ServiceBus();

        this.serviceBus = serviceBus;
    }

    public createGame(settings: IGameSettings, serviceBus: IServiceBus) {
        const game = new GameEngine(settings, this.serviceBus);

        this.gameList.push(game);
    }

    public join(params: IConnectParams) {
        const game = this.gameList.find(({ id }) => id === params.gameId);

        if (!game) {
            console.error("Cannot find game with id: ", params.gameId);
        } else {
            if (params.password !== game?.password) {
                console.error("Password is incorrect");
            }

            if (game?.is_full) {
                console.error("The game already have maximum players");
            }

            game.join(params.password, user);
        }
    }
}