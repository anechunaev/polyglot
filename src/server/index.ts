import morgan from 'morgan';
import Express from 'express';
import { Server } from 'socket.io';
import env from './environment';
import pageMeta from './middlewares/pageMeta';
import pageTemplate from './middlewares/pageTemplate';
import middlewareHandler404 from './middlewares/handler404';
import errorRequestHandler from './middlewares/errorRequestHandler';
import healthcheck from './middlewares/healthcheck';
import { enableGracefulShutdown } from './modules/gracefulShutdown';
import { GameManager } from './services/GameManager';

const app = Express();

// @TODO: remove placeholder
app.all("*", (_, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	next();
});
app.disable('x-powered-by');
app.all('/healthcheck', healthcheck);
app.use(morgan('tiny'));
app.use('/dist', Express.static('dist/client'));
app.all('/', pageMeta);
app.all('/', pageTemplate);
app.use('/', Express.static('static'));
app.all('/:page', pageMeta);
app.all('/:page', pageTemplate);
app.all('*', errorRequestHandler);
app.all('*', middlewareHandler404);

const io = new Server(8090, {
	cors: {
		// @TODO: remove placeholdder
		origin: "*"
	}
});

const server = app.listen(env.port, env.host, function onAppStart() {
	console.log(`Server @ http://${env.host}:${env.port}`);

	new GameManager(io);

	console.log("Game server was started");
});
enableGracefulShutdown(server);
