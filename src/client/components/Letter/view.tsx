import * as React from 'react';
import clsx from 'clsx';
import type { DraggableAttributes } from '@dnd-kit/core';

export type SyntheticListenerMap = Record<string, Function>;

export interface IProps {
	onClick?: (e: React.SyntheticEvent) => void;
	onDoubleClick?: (e: React.SyntheticEvent) => void;
	isSelected?: boolean;
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
	{
		classes,
		isSelected,
		onClick,
		onDoubleClick,
		letter,
		attributes,
		listeners,
		...rest
	}: React.PropsWithoutRef<IEncapsulatedProps & IWithClassesProps>,
	ref: any,
) {
	return (
		<div
			ref={ref}
			onClick={onClick}
			onContextMenu={onDoubleClick}
			onDoubleClick={onDoubleClick}
			className={clsx(classes.letter, classes.elevated, classes.draggable, {
				[classes.selected]: isSelected,
			})}
			{...attributes}
			{...listeners}
			{...rest}
		>
			<div className={classes.priceOverlay}>
				<span className={classes.price}>{letter.price}</span>
			</div>
			<span className={classes.value}>{letter.value}</span>
		</div>
	);
}

LetterView.displayName = 'LetterView';

export default LetterView;
