import * as React from 'react';

import View, { IProps as IViewProps } from './view';
import { useAppSelector } from '../../hooks';
import { selectField, selectPlayers, selectActivePlayer} from '../../reducers';

import withStyles from '../withStyles';
import styles from './styles.scss';

const PlayerLettersComponent = withStyles<IViewProps>(View, styles);

const PlayerLetters: React.FunctionComponent<any> = (props: any) => {
    const field = useAppSelector(selectField);
    const activePlayer = useAppSelector(selectActivePlayer);
    const players = useAppSelector(selectPlayers);

    const playerLetters = players[activePlayer].letters;

    return <PlayerLettersComponent field={field} playerLetters={playerLetters} {...props} />
}
PlayerLetters.displayName = 'PlayerLetters';

export default PlayerLetters;
