import * as React from 'react';
import type { DraggableAttributes } from '@dnd-kit/core';
import Letter from '../Letter';
import type { IProps as ILetterModelProps } from '../Letter/model';

export type SyntheticListenerMap = Record<string, Function>;

export interface IEncapsulatedProps {
	classes: Record<string, string>;
}

export interface IProps {
	isDragging?: boolean;
	letterId: string;
	// letters: any; // вынести в редакс
	style?: Record<string, string | undefined>;
	attributes: DraggableAttributes;
	listeners: SyntheticListenerMap | undefined;
	isSelected?: boolean;
	onClick?: (e?: React.SyntheticEvent) => void;
	onRightClick?: (e?: React.SyntheticEvent) => void;
	onDoubleClick?: (e?: React.SyntheticEvent) => void;
}

function DraggableLetter(props: React.PropsWithoutRef<IProps & IEncapsulatedProps>, ref: any) {
	return (
		<Letter
			ref={ref}
			letterId={props.letterId}
			onClick={props.onClick}
			onDoubleClick={props.onDoubleClick}
			onRightClick={props.onRightClick}
			classes={{ ...props.classes, elevated: props.isDragging ? props.classes.elevated : '' }}
			attributes={props.attributes}
			listeners={props.listeners}
			isSelected={props.isSelected}
			style={props.style}
		/>
	);
}

DraggableLetter.displayName = 'DraggableLetterView';

export default DraggableLetter;
