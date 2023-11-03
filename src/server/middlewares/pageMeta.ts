import type { Request, Response, NextFunction } from 'express';
import path from 'node:path';

function pageMeta (_req: Request, res: Response, next: NextFunction) {
    const manifest = eval('require("../client/manifest.json")');
    const title = 'Document';

    const assets: Record<string, string[]> = {
        scripts: [],
        styles: [],
        rest: [],
    };

    Object.keys(manifest).forEach(entry => {
        const ext = path.extname(entry);
        const assetPath = manifest[entry];

        switch(ext) {
        case '.js':
            assets.scripts.push(assetPath);
            break;
        case '.css':
            assets.styles.push(assetPath);
            break;
        default:
            assets.rest.push(assetPath);
        }
    })

    res.locals = {
		title,
        assets,
	};

    next();
}

export default pageMeta;
