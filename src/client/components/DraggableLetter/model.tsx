import * as React from 'react';
import { useDraggable, DraggableAttributes } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { IProps as ILetterProps } from '../Letter/model';

export type SyntheticListenerMap = Record<string, Function>;

export interface IProps {
    style?: Record<string, string | undefined>;
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap | undefined;
}

function Model(
    View: React.ForwardRefExoticComponent<React.PropsWithoutRef<ILetterProps & IProps> & React.RefAttributes<unknown>>,
): React.ComponentType<ILetterProps> {
    function DraggabaleLetterModel(props: ILetterProps) {
        const {attributes, listeners, setNodeRef, transform} = useDraggable({
            id: props.letterId || '',
          });
        const style = {
            transform: CSS.Translate.toString(transform),
        };

        return <View ref={setNodeRef} style={style} attributes={attributes} listeners={listeners} {...props} />;
    }

    return DraggabaleLetterModel;
}

export default Model;
