import type { Request, Response } from 'express';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import App from '../../client/app';

const template = ({ title, app, scripts, styles }: any) => `
<!DOCTYPE html>
<html lang="en">
	<head>
		<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>${title}</title>
		${Array.isArray(styles)
			? styles.map(style => `<link href="${style}" rel="stylesheet" />`).join('')
			: ''}
	</head>
	<body>
		<div id="app">${app}</div>
		${Array.isArray(scripts)
			? scripts.map(script => `<script src="${script}" defer></script>`).join('')
			: ''}
	</body>
</html>`;

export default function middlewareServerSideRender(_req: Request, res: Response) {
	const appMarkup = renderToString(React.createElement(App));
	const html = template({
		title: res.locals.title,
		app: appMarkup,
		scripts: res.locals.assets.scripts,
		styles: res.locals.assets.styles,
	});

	let minifyRegExp = /(\n\t\t)/g;
	let minifyReplace = "\n";

	if (process.env.NODE_ENV === 'production') {
		minifyRegExp = /(\t|\n)/g;
		minifyReplace = "";
	}

	res.send(html.replace(minifyRegExp, minifyReplace));
}
