import * as React from 'react';
import type { DraggableAttributes } from '@dnd-kit/core';
import { IProps as IViewProps } from './view';

import data from './data.json';

export type SyntheticListenerMap = Record<string, Function>;

export interface IProps {
    letterId: string;
    className?: string;
    isSelected?: boolean;
    onClick?: () => void;
    classes?: Record<string, string>;
}

export interface IEncapsulatedProps {
    style?: Record<string, string | undefined>;
    attributes?: DraggableAttributes;
    listeners?: SyntheticListenerMap | undefined;
}


function Model(
    View: React.ForwardRefExoticComponent<React.PropsWithoutRef<IEncapsulatedProps & IViewProps> & React.RefAttributes<HTMLDivElement>>
): React.ForwardRefExoticComponent<React.PropsWithoutRef<IEncapsulatedProps & IProps> & React.RefAttributes<HTMLDivElement>> {
    const LetterModel = React.forwardRef<HTMLDivElement, IEncapsulatedProps & IProps>(({ letterId, ...rest }: React.PropsWithoutRef<IProps & IEncapsulatedProps>, ref: any) => {
        const letter: {
            price: number;
            value: string;
        } = (data as any).letters[letterId];

        if (!letter) {
            return null;
        }

        return <View ref={ref} letter={letter} {...rest} />
    })

    return LetterModel;
}

export default Model;
