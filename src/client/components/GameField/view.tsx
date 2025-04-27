import * as React from 'react';
import clsx from 'clsx';
import { h32 } from 'xxhashjs';
import type { Field as IField } from '../../../types';
import Letter from '../../components/Letter';
import Field from '../../components/Field';
import type { IProps as ICellProps } from '../../components/Cell/view';
import DroppableCell from '../../components/DroppableCell';

export interface IProps {
    className?: string;
    field: IField;
    fieldLetters: string[];
}

export interface IEncapsulatedProps extends IProps {
    classes: Record<string, string>;
}

function FieldView({ classes, fieldLetters, className, field }: IEncapsulatedProps) {
    const renderLetter = (letterId: string) => {
        if (fieldLetters.includes(letterId)) {
            return null;
        }

        return (
            <Letter
                key={h32(letterId, 0xabcd).toString()}
                letterId={letterId}
            />
        );
    }

    return (
        <Field>
            {(field as ICellProps['bonus'][][]).map((row, index) => (
                <div
                    key={h32(`${JSON.stringify(row) + index}row`, 0xabcd).toString()}
                    style={{ width: '614px', gap: '1px', display: 'flex', margin: 0 }}
                >
                    {row.map((value, i) => {
                        const id = i.toString() + index.toString();
                        const position = {
                            x: i,
                            y: index,
                        };

                        const isLetterId = value && (!isNaN(Number(value)));
                        const isDisabledCell = !!(isLetterId && fieldLetters.includes(value));

                        return (
                            <DroppableCell
                                id={id}
                                disabled={isDisabledCell}
                                position={position}
                                key={h32(`${(value && !isLetterId ? value : '') + id}dr-cell`, 0xabcd).toString()}
                                bonus={value && !isLetterId ? value : null}
                            >
                                {isLetterId && renderLetter(value as unknown as string)}
                            </DroppableCell>
                        );
                    })}
                </div>
            ))}
        </Field>
    );
}

FieldView.defaultProps = {
    className: '',
};

FieldView.displayName = 'FieldView';

export default FieldView;
