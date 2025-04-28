import type { Socket } from 'socket.io';
import { EVENTS } from '../constants';


export function connect(controller: any) {
	return function (socket: Socket, next: () => void) {
		socket.on(EVENTS.JOIN_GAME, (payload: any) => {
			controller.onJoin(payload);
		});

		socket.on(EVENTS.GAME_START, (payload: any) => {
			controller.onStartGame(payload);
		});

		socket.on(EVENTS.ON_NEXT_TURN, (payload: any) => {
			controller.onNextTurn(payload);
		});

		socket.on(EVENTS.CREATE_GAME, (payload: any) => {
			const sessionId = socket.handshake.headers['x-session-id'];

			controller.onCreateGame({...payload, sessionId}).then((data: any) => {
				socket.emit(EVENTS.CREATE_GAME, JSON.stringify(data));
			});
		});

		socket.on(EVENTS.ADD_LETTER, (payload) => {
			const sessionId = socket.handshake.headers['x-session-id'];

			controller.onAddLetter(sessionId, payload);
		});
		socket.on(EVENTS.REMOVE_LETTER, (payload) => {
			const sessionId = socket.handshake.headers['x-session-id'];

			controller.onRemoveLetter(sessionId, payload);
		});

		socket.on(EVENTS.ON_NEXT_TURN, (payload) => {
			const sessionId = socket.handshake.headers['x-session-id'];

			controller.onNextTurn(payload);
		});

		// socket.on(EVENTS.ON_NEXT_TURN, (payload: any) => {
		// 	controller.onGameEmit(EVENTS.ON_NEXT_TURN, payload);
		// });

		next();
	}
};