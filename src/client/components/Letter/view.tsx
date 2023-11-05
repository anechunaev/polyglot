import * as React from 'react';
import clsx from 'clsx';

export interface IProps {
	className?: string;
	letter: {
		value: string;
		price: number;
	};
}

export interface IEncapsulatedProps extends IProps {
	classes: Record<string, string>;
}

function LetterView({ classes, letter, className }: IEncapsulatedProps) {
	return (
		<div className={clsx(classes.letter, className)}>
			<div className={classes.priceOverlay}>
				<span className={classes.price}>{letter.price}</span>
			</div>
			<span className={classes.value}>{letter.value}</span>
		</div>
	);
}

LetterView.defaultProps = {
	className: '',
};

LetterView.displayName = 'LetterView';

export default LetterView;
