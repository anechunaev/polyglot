import * as React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { IProps as ILetterProps } from '../Letter/model';
import type { IProps as IViewProps } from './view';

export type SyntheticListenerMap = Record<string, Function>;

export interface IProps {
	styles?: Record<string, string | number>;
	isSelected?: boolean;
	onClick?: (e?: React.SyntheticEvent) => void;
	onRightClick?: (e?: React.SyntheticEvent) => void;
	onDoubleClick?: (e?: React.SyntheticEvent) => void;
	disabled?: boolean;
	letterId: string;
	letters: any; // вынести в редакс
	// initialPosition: {
	// 	x: number;
	// 	y: number;
	// };
}

function Model(
	View: React.ComponentType<React.PropsWithoutRef<IViewProps> & React.RefAttributes<unknown>>,
): React.ForwardRefRenderFunction<unknown, IProps> {
	function DraggabaleLetterModel(props: IProps) {
		const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
			id: props.letterId || '',
			disabled: props.disabled,
			// data: {
			// 	initialPosition: props.initialPosition,
			// },
		});

		const style = {
			transform: CSS.Translate.toString(transform),
			...(props.styles || {}),
		};

		return (
			<View
				ref={setNodeRef}
				isDragging={isDragging}
				style={style}
				attributes={attributes}
				listeners={listeners}
				{...props}
			/>
		);
	}

	return DraggabaleLetterModel;
}

export default Model;
