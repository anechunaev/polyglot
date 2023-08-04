import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Request, Response } from 'express';

export default function middlewareHandler404(req: Request, res: Response) {
	if (req.accepts('html')) {
		fs.readFile(path.join(__dirname, '../../static/404.html'), 'utf-8', (err, page) => {
			if (err) {
				console.error(err);
				return res.status(404).json({ error: 'Not found' });
			}

			res.writeHead(404, {
				'Content-Type': 'text/html',
			});
			res.write(page);
			return res.end();
		});
	} else if (req.accepts('json')) {
		res.status(404).json({ error: 'Not found' });
	} else {
		res.status(404).type('txt').send('Not found');
	}
}
