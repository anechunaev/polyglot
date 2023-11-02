import * as React from 'react';
import { deepMerge } from '../../../lib/object';

export interface IWithStylesProps {
	classes: Record<string, string>;
}

function withStyles<P = {}>(
	Component: React.ComponentType<P & IWithStylesProps>,
	styles: Record<string, string>,
): React.ComponentType<P & Partial<IWithStylesProps>> {
	const styled = (props: P & Partial<IWithStylesProps>) =>
		React.createElement(Component, {
			...props,
			classes: deepMerge(styles, props.classes ?? {}),
		});

	styled.displayName = `WithStyles(${Component.displayName || Component.name})`;

	return styled;
}

export default withStyles;
