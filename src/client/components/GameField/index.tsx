import * as React from 'react';

import View, { type IProps as IViewProps, IConnectedProps } from './view';
import withStyles from '../withStyles';
import styles from './styles.scss';
import { useAppSelector } from '../../hooks';
import { selectField, selectWords } from '../../reducers';

export type IProps = IViewProps;

const StyledView = withStyles<IConnectedProps>(View, styles);

function Field(props: IProps) {
	const field = useAppSelector(selectField);
	const words = useAppSelector(selectWords);

	return (
		<StyledView
			{...props}
			field={field}
			words={words}
		/>
	);
}

export default Field;
