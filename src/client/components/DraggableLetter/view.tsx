import * as React from 'react';
import type { DraggableAttributes } from '@dnd-kit/core';
import Letter from '../Letter';
import type { IProps as ILetterModelProps } from '../Letter/model';

export type SyntheticListenerMap = Record<string, Function>;

export interface IProps {
    classes?: Record<string, string>;
    style?: Record<string, string | undefined>;
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap | undefined;
}

function DraggableLetter(
	props: React.PropsWithoutRef<IProps & ILetterModelProps>,
	ref: any,
) {
	return <Letter ref={ref} {...props} />;
}

DraggableLetter.displayName = 'DraggableLetterView';

export default DraggableLetter;
