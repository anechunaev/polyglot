import * as React from 'react';
import clsx from 'clsx';

export interface IProps {
	ref?: any;
	className?: string;
	letter: {
		value: string;
		price: number;
	};
}

export interface IEncapsulatedProps extends IProps {
	onMouseUp?: (event: any) => void;
	onMouseDown?: (event: any) => void;
	onMouseMove?: (event: any) => void;
}

export interface IWithClassesProps {
	classes: Record<string, string>;
}

function LetterView(
	{ classes, letter, className, ...rest }: React.PropsWithoutRef<IEncapsulatedProps & IWithClassesProps>,
	ref: any,
) {
	return (
		<div className={clsx(classes.letter, className)} {...rest} ref={ref}>
			<div className={classes.priceOverlay}>
				<span className={classes.price}>{letter.price}</span>
			</div>
			<span className={classes.value}>{letter.value}</span>
		</div>
	);
}

LetterView.displayName = 'LetterView';

export default LetterView;
