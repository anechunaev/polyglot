import { Server, Socket } from 'socket.io';
import type { UserId, GameId, IPlayer, ISpectator, IUser, IWords } from '../types';
import type { IGameSettings, IGame } from '../engine/game';
import { EVENTS, DEFAULT_TIMER_VALUE_SEC, DEFAULT_MAX_SCORE_VALUE } from '../constants';
import { GameEngine } from '../engine/game';
import { Dictionary } from '../server/services/dictionary';

export type ClientId = string;
export type SessionId = string;

export interface IConnectParams {
	gameId: GameId;
	userId: UserId;
	password?: string;
}

export interface IPayload {
	sessionId: SessionId;
}

export interface ICreateGamePayload extends IPayload {
	settings: ISettings;
	user: IUser;
}

export interface IJoinGamePayload extends IPayload {
	params: IConnectParams;
	user: ISpectator | IPlayer;
}

export interface IStartGamePayload extends IPayload {
	gameId: GameId;
}

export interface INextTurnPayload extends IPayload {
	gameId: GameId;
	turn: {
		words: IWords;
		playerId: UserId;
	};
	secret: string;
}

export interface Subscriptions {
	[gameId: GameId]: ClientId[];
}

export interface SessionMap {
	[sessionId: SessionId]: GameId;
}

export interface Sessions {
	[sessionId: SessionId]: Socket;
}

export type Emit = (gameId: GameId, eventName: keyof typeof EVENTS, payload: Record<string, any>) => void;

export interface ISettings extends IGameSettings {
	timer: number;
	password?: string;
	max_players: number;
	max_score: number;
}

const getCurrentUser = () => {
	// @TOGO: it should be jwt token in cookies
	// https://trello.com/c/3ojCGjWd/65-%D0%BF%D0%BE%D1%81%D0%BB%D0%B5-%D1%83%D1%81%D0%BF%D0%B5%D1%88%D0%BD%D0%BE%D0%B9-%D0%B0%D0%B2%D1%82%D0%BE%D1%80%D0%B8%D0%B7%D0%B0%D1%86%D0%B8%D0%B8-%D0%B2-cookies-%D0%BF%D1%80%D0%BE%D1%81%D1%82%D0%B0%D0%B2%D0%BB%D1%8F%D0%B5%D1%82%D1%81%D1%8F-jwt-accesstoken
	const accessToken = { id: '7301cf16-5e08-4019-bf84-734d3d73f7bd', name: 'jpig' };

	return accessToken;
};

export class Controller {
	private games: {
		[gameId: GameId]: {
			instance: IGame;
			password?: string;
			max_players: number;
		};
	};

	private gameIds: GameId[];
	private subscription: Subscriptions;
	private sessions: Sessions;
	private sessionMap: SessionMap;
	private server: Server;

	constructor(server: Server) {
		this.games = {};
		this.gameIds = [];
		this.subscription = {};
		this.sessions = {};
		this.sessionMap = {};

		this.server = server;
		this.emit = this.emit.bind(this);

		this.server.on('connection', (ws: Socket) => {
			const sessionId = ws.handshake.headers['x-session-id'];

			this.sessions[sessionId as string] = ws;

			console.log(`Client with session id ${sessionId} was connected`);

			const activeGame = this.sessionMap[sessionId as string];

			if (activeGame) {
				const gameState = this.games[activeGame].instance.getState();

				ws.emit(EVENTS.GAME_SESSION_RECONNECT, JSON.stringify({gameId: activeGame, game: gameState}));
			}

			ws.on(EVENTS.GET_CURRENT_USER, () => {
				ws.emit(EVENTS.GET_CURRENT_USER, getCurrentUser());
			});

			ws.on(EVENTS.CREATE_GAME, async (payload: ICreateGamePayload) => {
				const { game, gameId } = await this.createGame(payload.sessionId, payload);

				this.emitAll(EVENTS.UPDATE_GAME_LIST, this.gameIds);
				ws.emit(EVENTS.CREATE_GAME, JSON.stringify({ gameId, game: game.getState() }));

				game.start();
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

	private createGameSession(gameId: GameId, sessionId: SessionId) {
		this.sessionMap[sessionId] = gameId;
	}

	public emit = (gameId: GameId, eventName: keyof typeof EVENTS, payload: Record<string, any>) => {
		const sessionIds = this.subscription[gameId];

		sessionIds.forEach((sessionId) => {
			const session = this.sessions[sessionId];

			session.emit(eventName, payload);
		});
	};

	private emitAll(eventName: keyof typeof EVENTS, payload: Record<string, any>) {
		Object.keys(this.sessions).forEach((sessionId) => {
			this.sessions[sessionId].emit(eventName, payload);
		});
	}

	private async createGame(sessionId: SessionId, { settings, user }: { settings: ISettings; user: IUser }) {
		const gameSettings = {
			timer: settings.timer || DEFAULT_TIMER_VALUE_SEC,
			max_score: settings.max_score || DEFAULT_MAX_SCORE_VALUE
		}

		const dictionary = new Dictionary();
		await dictionary.load();
	
		const game = new GameEngine(this.emit, gameSettings, user, dictionary);

		const { id } = game;

		this.subscribe(id, sessionId);
		this.createGameSession(id, sessionId);

		this.games[id] = {
			instance: game,
			password: settings.password,
			max_players: settings.max_players,
		};

		this.gameIds.push(id);

		return { gameId: id, game };
	}

	private canJoinGame(gameId: GameId) {
		const game = this.games[gameId];
		const players = game.instance.getPlayers().length;
	
		return !(game.max_players === players);
	}

	public join({ sessionId, params, user }: IJoinGamePayload) {
		const game = this.games[params.gameId];

		if (!game) {
			console.error('Cannot find game with id: ', params.gameId);
		} else {
			if (params.password !== game?.password) {
				console.error('Password is incorrect');
				return;
			}

			if (this.canJoinGame(params.gameId)) {
				console.error('The game already have maximum players');
				return;
			}

			this.subscribe(params.gameId, sessionId);
			game.instance.join(user, params.password);
		}
	}
}
