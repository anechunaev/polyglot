import * as React from 'react';
import clsx from 'clsx';
import { h32 } from 'xxhashjs';
import Field from '../Field';
import Cell from '../Cell';
import Letter from '../Letter';
import Timer from '../TurnTimer';
import Button from '../Button';

import data from './data.json';

export interface IProps {
	letters: string[];
	onClick: (id: number) => void;
	selectedCells: number[];
}

export interface IEncapsulatedProps extends IProps {
	classes: Record<string, string>;
}

function SidebarView({ classes, letters, selectedCells, onClick }: IEncapsulatedProps) {
	return (
		<div className={classes.sidebar}>
			<Timer seconds={120} remainSeconds={0} />
			<Field className={classes.field}>
				{letters.map((letterId: string, index) => {
					const letter = (data as any).letters[letterId];

					return (
						<Cell
							key={h32(letter.value + index + 'cell', 0xabcd).toString()}
							bonus={null}
							className={clsx({
								[classes.selected]: selectedCells.includes(index),
							})}
						>
							<Cell
								key={h32(letter.value + index, 0xabcd).toString()}
								bonus={null}
								onClick={() => onClick(index)}
								className={clsx({
									[classes.selected]: selectedCells.includes(index),
								})}
							>
								<Letter className={classes.letter} letter={{ price: letter.price, value: letter.value }} />
							</Cell>
						</Cell>
					);
				})}
			</Field>
			<div className={classes.buttons}>
				<Button className={classes.button} onClick={() => {}}>
					Замена букв
				</Button>
				<Button className={classes.button} onClick={() => {}}>
					Завершить ход
				</Button>
			</div>
		</div>
	);
}

export default SidebarView;
