import * as React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { IProps as ILetterProps } from '../Letter/model';
import type { IProps as IViewProps } from './view';

export type SyntheticListenerMap = Record<string, Function>;

function Model(
    View: React.ComponentType<React.PropsWithoutRef<IViewProps & ILetterProps> & React.RefAttributes<unknown>>    // View: React.ForwardRefExoticComponent<React.PropsWithoutRef<ILetterProps & IViewProps> & React.RefAttributes<unknown>>,
): React.ForwardRefRenderFunction<unknown, ILetterProps> {
    function DraggabaleLetterModel(props: ILetterProps) {
        const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
            id: props.letterId || '',
        });

        const style = {
            transform: CSS.Translate.toString(transform),
        };

        return <View ref={setNodeRef} isDragging={isDragging} style={style} attributes={attributes} listeners={listeners} {...props} />;
    }

    return DraggabaleLetterModel;
}

export default Model;
