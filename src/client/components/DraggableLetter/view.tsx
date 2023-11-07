import * as React from 'react';
import Letter from '../Letter';
import { IProps as ILetterViewProps } from '../Letter/view';

export interface IProps {
	onMouseUp: (event: any) => void;
	onMouseDown: (event: any) => void;
	onMouseMove: (event: any) => void;
}

function DraggableLetter(
	{ onMouseDown, onMouseMove, onMouseUp, ...rest }: React.PropsWithoutRef<IProps & ILetterViewProps>,
	ref: any,
) {
	return <Letter ref={ref} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} {...rest} />;
}

DraggableLetter.displayName = 'DraggableLetterView';

export default DraggableLetter;
