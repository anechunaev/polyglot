import { Server, Socket } from 'socket.io';
import uuid4 from "uuid4";
import type { UserId, IPlayer, ISpectator } from './User';
import type { GameId, IGameSettings, IGame, IWord } from './GameEngine';
import { EVENTS } from '../../constants';
import { GameEngine } from './GameEngine';

export type ClientId = string;
export type SessionId = string;


export interface IConnectParams {
    gameId: GameId;
    userId: UserId;
    password?: string;
};

export interface IPayload {
    sessionId: SessionId;
}

export interface ICreateGamePayload extends IPayload {
    game: {
        settings: ISettings;
        playerName: IPlayer["name"];
    }
};

export interface IJoinGamePayload extends IPayload {
    params: IConnectParams;
    user: ISpectator | IPlayer;
};

export interface IStartGamePayload extends IPayload {
    gameId: GameId;
};

export interface INextTurnPayload extends IPayload {
    gameId: GameId;
    turn: {
        words: IWord[];
        playerId: UserId;
    };
    secret: string;
}

export interface Subscriptions {
    [gameId: GameId]: ClientId[]
};

export interface Sessions {
    [sessionId: SessionId]: Socket;
}

export type Emit = (gameId: GameId, eventName: keyof typeof EVENTS, payload: Record<string, any>) => void;

export interface ISettings extends IGameSettings {
    password?: string;
    max_players: number;
};

export class GameManager {
    private games: {
        [gameId: GameId]: {
            instance: IGame;
            password?: string;
            max_players: number;
        }
    };
    private gameIds: GameId[];
    private subscription: Subscriptions;
    private sessions: Sessions;
    private server: Server;

    constructor(server: Server) {
        this.games = {};
        this.gameIds = [];
        this.subscription = {};
        this.sessions = {};

        this.server = server;
        this.emit = this.emit.bind(this);

        this.server.on("connection", (ws: Socket) => {
            const sessionId = ws.handshake.headers["x-session-id"];

            this.sessions[sessionId as string] = ws;

            console.log(`Client with session id ${sessionId} was connected`);

            ws.on(EVENTS.CREATE_GAME, (payload: ICreateGamePayload) => {
                const { game, gameId } = this.createGame(payload.sessionId, payload.game);

                this.emitAll(EVENTS.UPDATE_GAME_LIST, this.gameIds);
                ws.emit(EVENTS.CREATE_GAME, { gameId, game: game.getState() });
            });

            ws.on(EVENTS.JOIN_GAME, (payload: IJoinGamePayload) => {
                this.join(payload);
            });

            ws.on(EVENTS.GAME_START, (payload: IStartGamePayload) => {
                this.games[payload.gameId].instance.start();
            });

            ws.on(EVENTS.ON_NEXT_TURN, (payload: INextTurnPayload) => {
                console.log('---payload-----', JSON.stringify(payload));
                this.games[payload.gameId].instance.nextTurn(payload.turn, payload.secret);
            });
        });
    }

    private subscribe(gameId: GameId, sessionId: SessionId) {
        if (this.subscription[gameId]) {
            this.subscription[gameId].push(sessionId);
        } else {
            this.subscription[gameId] = [sessionId];
        }
    }

    public emit = (gameId: GameId, eventName: keyof typeof EVENTS, payload: Record<string, any>) => {
        const sessionIds = this.subscription[gameId];

        sessionIds.forEach(sessionId => {
            const session = this.sessions[sessionId];

            session.emit(eventName, payload);
        });
    }

    private emitAll(eventName: keyof typeof EVENTS, payload: Record<string, any>) {
        Object.keys(this.sessions).forEach(sessionId => {
            this.sessions[sessionId].emit(eventName, payload);
        });
    }

    public createGame(sessionId: SessionId, { settings, playerName }: { settings: ISettings, playerName: IPlayer["name"] }) {
        const gameId = uuid4();

        const game = new GameEngine(this.emit, gameId, settings, playerName);
        this.subscribe(gameId, sessionId)

        this.games[gameId] = {
            instance: game,
            password: settings.password,
            max_players: settings.max_players
        };

        this.gameIds.push(gameId);

        return { gameId, game };
    }

    public join({ sessionId, params, user }: IJoinGamePayload) {
        const game = this.games[params.gameId];

        if (!game) {
            console.error("Cannot find game with id: ", params.gameId);
        } else {
            if (params.password !== game?.password) {
                console.error("Password is incorrect");
                return;
            }

            if (game.instance.canJoin(game.max_players)) {
                console.error("The game already have maximum players");
                return;
            }

            this.subscribe(params.gameId, sessionId);
            game.instance.join(user, params.password);
        }
    }
}