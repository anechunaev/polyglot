import * as React from 'react';
import Model from './model';
import View, { IEncapsulatedProps, IWithClassesProps } from './view';
import withStyles from '../withStyles';
import styles from './styles.scss';

const Letter = Model(
	withStyles(React.forwardRef<HTMLDivElement, IEncapsulatedProps & IWithClassesProps>(View), styles, {
		withMergeClasses: false,
	}),
);

Letter.defaultProps = {
	isSelected: false,
	onClick: () => {},
	onDoubleClick: () => {},
};
Letter.displayName = 'Letter';

export default Letter;
