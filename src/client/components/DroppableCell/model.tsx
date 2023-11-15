import * as React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { IProps as ICellProps } from '../Cell/view';

export interface IProps {
    id?: string;
}

function Model(
    View: React.ForwardRefExoticComponent<React.PropsWithoutRef<ICellProps & IProps> & React.RefAttributes<unknown>>,
): React.ComponentType<ICellProps & IProps> {
    function DroppableCellModel(props: ICellProps & IProps) {
        const { isOver, setNodeRef, node } = useDroppable({
            id: props.id || '',
        });

        if (isOver) {
          console.log('isOver', isOver, node);
        }

        const newProps = {...props};
        delete newProps.id;

        return <View ref={setNodeRef} {...newProps} />
    }

    return DroppableCellModel;
}

export default Model;
