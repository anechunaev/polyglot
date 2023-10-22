export default {
	port: process.env.PORT ? Number(process.env.PORT) : 8080,
	host: process.env.HOST ?? '0.0.0.0',
};
