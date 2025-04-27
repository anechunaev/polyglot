import * as React from 'react';

import View, { IProps as IViewProps } from './view';
import { useAppSelector } from '../../hooks';
import {  selectField} from '../../reducers';

// import withStyles from '../withStyles';
import styles from './styles.scss';

// const FieldComponent = withStyles<IViewProps>(View, styles);

const Field: React.FunctionComponent<any> = (props: any) => {
    const field = useAppSelector(selectField);

    return <View field={field} {...props}/>
}
Field.displayName = 'Field';

export default Field;
