import * as React from 'react';
import clsx from 'clsx';
import type { IWord } from '../../../types';

export type IProps = IWord;

export interface IEncapsulatedProps extends IProps {
	classes: Record<string, string>;
}

const LETTER_SIZE = 40; // px
const LETTER_GAP = 1; // px

function WordHighlightView({ classes, ...rest }: IEncapsulatedProps) {
	const [y, x] = rest.start.split(';').map(Number);
	const dx = x * (LETTER_SIZE + LETTER_GAP);
	const dy = y * (LETTER_SIZE + LETTER_GAP);
	const width = rest.letterIds.length * (LETTER_SIZE + LETTER_GAP) - LETTER_GAP;
	const height = LETTER_SIZE;
	const style = {
		transform: `translate(${dx}px, ${dy}px)`,
		width: `${rest.kind === 'vertical' ? height : width}px`,
		height: `${rest.kind === 'vertical' ? width : height}px`,
	};
	return (
		<div
			className={clsx(
				classes.highlight,
				rest.kind === 'vertical' ? classes.vertical : classes.horizontal,
				rest.isPrevious ? classes.previous : null,
				rest.isValid ? classes.valid : classes.invalid,
			)}
			style={style}
		>
			<div className={clsx(classes.score)}>{rest.score}</div>
		</div>
	);
}

export default WordHighlightView;
