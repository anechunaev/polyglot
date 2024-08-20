import * as React from 'react';
import Model from './model';
import View, { IEncapsulatedProps, IWithClassesProps } from './view';
import { useAppSelector } from '../../hooks';
import { selectLetter } from '../../reducers';
import withStyles from '../withStyles';
import styles from './styles.scss';

const Component = Model(
	withStyles(React.forwardRef<HTMLDivElement, IEncapsulatedProps & IWithClassesProps>(View), styles),
);

const Letter: React.FunctionComponent<any> = ({letterId, ...rest}) => {
	const letter = useAppSelector(state => selectLetter(state, letterId));

	return <Component letter={letter} {...rest} />
}

Letter.defaultProps = {
	isSelected: false,
	onClick: () => {},
	onRightClick: () => {},
	onDoubleClick: () => {},
};
Letter.displayName = 'Letter';

export default Letter;
