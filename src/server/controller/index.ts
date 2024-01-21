import { Server, Socket } from 'socket.io';
import uuid4 from "uuid4";
import type { UserId, GameId, IPlayer, ISpectator, IUser } from '../../types';
import type { IGameSettings, IGame, IWord } from '../../engine/game';
import { EVENTS } from '../../constants';
import { GameEngine } from '../../engine/game';

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
    settings: ISettings;
    user: IUser
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

export class Controller {
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

            ws.on(EVENTS.GET_CURRENT_USER, () => {
                ws.emit(EVENTS.GET_CURRENT_USER, this.getCurrentUser());
            });

            ws.on(EVENTS.CREATE_GAME, (payload: ICreateGamePayload) => {
                const { game, gameId } = this.createGame(payload.sessionId, payload);

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

    private getCurrentUser() {
        // @TOGO: it should be jwt token in cookies
        // https://trello.com/c/3ojCGjWd/65-%D0%BF%D0%BE%D1%81%D0%BB%D0%B5-%D1%83%D1%81%D0%BF%D0%B5%D1%88%D0%BD%D0%BE%D0%B9-%D0%B0%D0%B2%D1%82%D0%BE%D1%80%D0%B8%D0%B7%D0%B0%D1%86%D0%B8%D0%B8-%D0%B2-cookies-%D0%BF%D1%80%D0%BE%D1%81%D1%82%D0%B0%D0%B2%D0%BB%D1%8F%D0%B5%D1%82%D1%81%D1%8F-jwt-accesstoken
        const access_token = {id: '7301cf16-5e08-4019-bf84-734d3d73f7bd', name: 'jpig'};

        return access_token;
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

    public createGame(sessionId: SessionId, { settings, user }: { settings: ISettings, user: IUser }) {
        const gameId = uuid4();

        const game = new GameEngine(this.emit, gameId, settings, user);
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