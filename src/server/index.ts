import morgan from 'morgan';
import Express from 'express';
import env from './environment';
import pageTemplate from './middlewares/pageTemplate';
import middlewareHandler404 from './middlewares/handler404';
import errorRequestHandler from './middlewares/errorRequestHandler';
import healthcheck from './middlewares/healthcheck';
import { enableGracefulShutdown } from './modules/gracefulShutdown';

const app = Express();

app.disable('x-powered-by');
app.all('/healthcheck', healthcheck);
app.use(morgan('tiny'));
app.use('/dist', Express.static('dist/client'));
app.use('/', Express.static('static'));
app.all('/', pageTemplate);
app.all('/:page', pageTemplate);
app.all('*', errorRequestHandler);
app.all('*', middlewareHandler404);

const server = app.listen(env.port, env.host, function onAppStart() {
	console.log(`Server @ http://${env.host}:${env.port}`);
});
enableGracefulShutdown(server);
