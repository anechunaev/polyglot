import * as React from 'react';
import clsx from 'clsx';
import type { DraggableAttributes } from '@dnd-kit/core';

export type SyntheticListenerMap = Record<string, Function>;

export interface IProps {
	onClick?: () => void;
	isSelected?: boolean;
	className?: string;
	letter: {
		value: string;
		price: number;
	};
}

export interface IEncapsulatedProps extends IProps {
    style?: Record<string, string | undefined>;
    attributes?: DraggableAttributes;
    listeners?: SyntheticListenerMap | undefined;
}

export interface IWithClassesProps {
	classes: Record<string, string>;
}

function LetterView(
	{ classes, isSelected, className, onClick, letter, attributes, listeners, ...rest }: React.PropsWithoutRef<IEncapsulatedProps & IWithClassesProps>,
	ref: any,
) {
	return (
		<div ref={ref} onClick={onClick} className={clsx(classes.letter, className, {
			[classes.selected]: isSelected
		})} {...attributes} {...listeners} {...rest}>
			<div className={classes.priceOverlay}>
				<span className={classes.price}>{letter.price}</span>
			</div>
			<span className={classes.value}>{letter.value}</span>
		</div>
	);
}

LetterView.displayName = 'LetterView';

export default LetterView;
