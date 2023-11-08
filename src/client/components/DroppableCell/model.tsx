import * as React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { IProps as ICellProps } from '../Cell/view';

export interface IProps { }

function Model(
    View: React.ForwardRefExoticComponent<React.PropsWithoutRef<ICellProps & IProps> & React.RefAttributes<unknown>>,
): React.ComponentType<ICellProps> {
    function DroppableCellModel(props: ICellProps) {
        const { isOver, setNodeRef, rect, node, active } = useDroppable({
            id: props.id,
        });

        return <View ref={setNodeRef} {...props} />
    }

    return DroppableCellModel;
}

export default Model;
