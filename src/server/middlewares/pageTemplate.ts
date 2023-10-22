import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Request, Response, NextFunction } from 'express';

export default function middlewareServerSideRender(_req: Request, res: Response, next: NextFunction) {
	fs.readFile(path.join(__dirname, '../../static/index.html'), 'utf-8', (err, page) => {
		if (err) {
			console.error(err);
			res.status(404);
			return next();
		}

		res.writeHead(404, {
			'Content-Type': 'text/html',
		});
		res.write(page);
		return res.end();
	});
}
