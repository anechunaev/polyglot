import * as React from 'react';
import { h32 } from 'xxhashjs';
import type { Field as IField, IWord } from '../../../types';
import Letter from '../Letter';
import Field from '../Field';
import type { IProps as ICellProps } from '../Cell/view';
import DroppableCell from '../DroppableCell';
import WordHighlight from '../WordHighlight';

export interface IProps {
	fieldLetters: string[]; // LetterId[]
}

export interface IConnectedProps extends IProps {
	field: IField;
	words?: IWord[];
}

export interface IEncapsulatedProps extends IConnectedProps {
	classes: Record<string, string>;
}

function FieldView({ classes, field, words }: IEncapsulatedProps) {
	const wordsList = words?.reduce((acc, word) => {
		acc.push(<WordHighlight key={h32(word.letterIds.join(','), 0xabcd).toString()} {...word} />);
		return acc;
	}, [] as React.ReactNode[]);

	return (
		<Field>
			{(field).map((row, index) => (
				<div key={h32(`${JSON.stringify(row) + index}row`, 0xabcd).toString()} className={classes.row}>
					{row.map((cell, i) => {
						const id = `${i}-${index}`;
						const position = {
							x: i,
							y: index,
						};

						return (
							<DroppableCell
								id={id}
								disabled={Boolean(cell.letterId)}
								position={position}
								key={h32(`${(cell.bonus || '') + id}dr-cell`, 0xabcd).toString()}
								bonus={cell.bonus}
							>
								{!!cell.letterId && (
									<Letter key={h32(cell.letterId, 0xabcd).toString()} letterId={cell.letterId} />
								)}
							</DroppableCell>
						);
					})}
				</div>
			))}
			{!!wordsList?.length && wordsList}
		</Field>
	);
}

FieldView.displayName = 'FieldView';

export default FieldView;
