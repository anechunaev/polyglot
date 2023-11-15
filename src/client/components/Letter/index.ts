import * as React from 'react';
import Model from './model';
import View, { IEncapsulatedProps, IWithClassesProps } from './view';
import withStyles from '../withStyles';
import styles from './styles.scss';

const Letter = Model(withStyles<IEncapsulatedProps, HTMLDivElement>(
	React.forwardRef<HTMLDivElement, IEncapsulatedProps & IWithClassesProps>(View),
	styles,
	{ withMergeClasses: true }
));

Letter.defaultProps = {
	isSelected: false,
	onClick: () => {}
}
Letter.displayName = 'Letter';

export default Letter;
