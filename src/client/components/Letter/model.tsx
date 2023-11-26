import * as React from 'react';
import type { DraggableAttributes } from '@dnd-kit/core';
import { IProps as IViewProps } from './view';

import data from './data.json';

export type SyntheticListenerMap = Record<string, Function>;

export interface IProps {
	letterId: string;
	isSelected?: boolean;
	onDoubleClick?: (e?: React.SyntheticEvent) => void;
	onClick?: (e?: React.SyntheticEvent) => void;
}

export interface IEncapsulatedProps {
	classes: Record<string, string>;
	style?: Record<string, string | undefined>;
	attributes?: DraggableAttributes;
	listeners?: SyntheticListenerMap | undefined;
}

function Model(
	View: React.ForwardRefExoticComponent<
		React.PropsWithoutRef<IEncapsulatedProps & IViewProps> & React.RefAttributes<HTMLDivElement>
	>,
): React.ForwardRefExoticComponent<
	React.PropsWithoutRef<IEncapsulatedProps & IProps> & React.RefAttributes<HTMLDivElement>
> {
	const LetterModel = React.forwardRef<HTMLDivElement, IEncapsulatedProps & IProps>(
		({ letterId, ...rest }: React.PropsWithoutRef<IProps & IEncapsulatedProps>, ref: any) => {
			const letter: {
				price: number;
				value: string;
			} = (data as any).letters[letterId];

			if (!letter) {
				return null;
			}

			return <View ref={ref} letter={letter} {...rest} />;
		},
	);

	LetterModel.defaultProps = {
		isSelected: false,
		onDoubleClick: () => {},
		onClick: () => {},
		style: undefined,
		attributes: undefined,
		listeners: undefined,
	};

	return LetterModel;
}

export default Model;
