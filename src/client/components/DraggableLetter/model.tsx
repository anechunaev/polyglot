import * as React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { IProps as ILetterProps } from '../Letter/model';
import type { IProps as IViewProps } from './view';

export type SyntheticListenerMap = Record<string, Function>;

export interface IProps {
	styles: Record<string, string | number>;
	disabled?: boolean;
	letters: any; // вынести в редакс
	initialPosition: {
		x: number;
		y: number;
	};
}

function Model(
	View: React.ComponentType<React.PropsWithoutRef<IViewProps & ILetterProps> & React.RefAttributes<unknown>>,
): React.ForwardRefRenderFunction<unknown, ILetterProps & IProps> {
	function DraggabaleLetterModel(props: ILetterProps & IProps) {
		const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
			id: props.letterId || '',
			disabled: props.disabled,
			data: {
				initialPosition: props.initialPosition,
			},
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
