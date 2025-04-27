import * as React from 'react';

import View, { IProps as IViewProps } from './view';
import { useAppSelector } from '../../hooks';
import { selectField} from '../../reducers';

import withStyles from '../withStyles';
import styles from './styles.scss';

const PlayerLettersComponent = withStyles<IViewProps>(View, styles);

const PlayerLetters: React.FunctionComponent<any> = (props: any) => {
    const field = useAppSelector(selectField);

    return <PlayerLettersComponent field={field} {...props} />
}
PlayerLetters.displayName = 'PlayerLetters';

export default PlayerLetters;
