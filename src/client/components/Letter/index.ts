import * as React from 'react';
import View, { IEncapsulatedProps, IWithClassesProps } from './view';
import withStyles from '../withStyles';
import styles from './styles.scss';

const Letter = withStyles<IEncapsulatedProps, HTMLDivElement>(
	React.forwardRef<HTMLDivElement, IEncapsulatedProps & IWithClassesProps>(View),
	styles,
);

Letter.defaultProps = {
	className: '',
	onMouseUp: () => {},
	onMouseMove: () => {},
	onMouseDown: () => {},
};

Letter.displayName = 'Letter';

export default Letter;
