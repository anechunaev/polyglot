import * as React from 'react';
import { deepMerge } from '../../../lib/object';

export interface IWithStylesProps {
	classes: Record<string, string>;
}

export type IInnerComponent<P, R> =
	| React.ForwardRefExoticComponent<P & IWithStylesProps & React.RefAttributes<R>>
	| React.ComponentType<P & IWithStylesProps>;

type IComponentProps<P, R> = React.PropsWithoutRef<P & Partial<IWithStylesProps>> & React.RefAttributes<R>;

export type IOuterComponent<P, R> = React.ForwardRefExoticComponent<IComponentProps<P, R>>;

function withStyles<P = {}, R = unknown>(
	Component: IInnerComponent<P, R>,
	styles: Record<string, string>,
): IOuterComponent<P, R> {
	const styled = React.forwardRef<R, P & Partial<IWithStylesProps>>(
		(props: P & Partial<IWithStylesProps>, ref: React.ForwardedRef<R>) =>
			React.createElement(Component, {
				...props,
				ref,
				classes: deepMerge(styles, props.classes ?? {}),
			}),
	);

	styled.displayName = `WithStyles(${Component.displayName || Component.name})`;

	return styled;
}

export default withStyles;
