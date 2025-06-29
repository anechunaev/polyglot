import * as React from 'react';
import clsx from 'clsx';
import { h32 } from 'xxhashjs';

export interface IProps {
	bonus: 'l2' | 'l3' | 'w2' | 'w3' | null;
	style?: Record<string, string>;
	onClick?: (e: React.SyntheticEvent) => void;
	children?: React.ReactNode | null;
}

export interface IEncapsulatedProps extends IProps {
	classes: Record<string, string>;
}

export const bonuses: Record<string, string[]> = {
	l2: ['letter', '×2'],
	l3: ['letter', '×3'],
	w2: ['word', '×2'],
	w3: ['word', '×3'],
};

function CellView({ classes, bonus, children, style, onClick }: React.PropsWithoutRef<IEncapsulatedProps>, ref: any) {
	return (
		<div
			ref={ref}
			style={style}
			onClick={onClick}
			className={clsx(classes.cell, {
				[classes[bonus || ''] || '']: true,
			})}
		>
			{!!bonuses[bonus || ''] && (
				<div className={classes.bonusContainer}>
					{bonuses[bonus!].map((item, i) => (
						<span key={h32(`${item + i}cell`, 0xabcd).toString()}>{item}</span>
					))}
				</div>
			)}
			{children}
		</div>
	);
}

CellView.displayName = 'CellView';

export default CellView;
