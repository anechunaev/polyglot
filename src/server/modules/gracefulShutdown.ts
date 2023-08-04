import { Server } from "node:http";
import { Socket } from "node:net";

export function getShutdownHandler(server: Server): () => void {
	const sockets: Record<number, Socket> = {};
	let nextSocketId = 0;

	server.on("connection", function onServerConnection(socket) {
		const socketId = nextSocketId++;
		sockets[socketId] = socket;

		socket.once("close", function onSocketClose() {
			delete sockets[socketId];
		});
	});

	function waitForSocketsToClose(counter: number) {
		if (counter > 0) {
			console.info(`Waiting for ${counter}s for all connections to close...`);
			setTimeout(waitForSocketsToClose, 1000, counter - 1);
			return;
		}

		console.info("Forcing all connections to close now");

		for (const socketId in sockets) {
			sockets[socketId].destroy();
		}
	}

	return function shutdown() {
		waitForSocketsToClose(10);

		server.close(function onServerClosed(err?: Error) {
			if (err) {
				console.error(err);
				process.exitCode = 1;
			}
			process.exit();
		});
	}
}

export function enableGracefulShutdown(server: Server) {
	const shutdown = getShutdownHandler(server);

	process.on('SIGINT', function onSigInt() {
		console.info('\nGot SIGINT. Graceful shutdown @ ' + (new Date()).toISOString());
		shutdown();
	});

	process.on('SIGTERM', function onSigTerm() {
		console.info('\nGot SIGTERM. Graceful shutdown @ ' + (new Date()).toISOString());
		shutdown();
	});

	process.on('unhandledRejection', function unhandledRejectionHandler(reason, promise) {
		console.error("Unhandled rejection at:\n", promise, "\n\nReason: ", reason);
		process.exitCode = 1;
		shutdown();
	});

	process.on('uncaughtException', function uncaughtExceptionHandler(error) {
		console.error("Uncaught exception:\n", error);
		process.exitCode = 1;
		shutdown();
	});
}
