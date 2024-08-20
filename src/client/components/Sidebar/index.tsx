import * as React from 'react';

import Model from './model';
import View, {IProps} from './view';
import withStyles from '../withStyles';
import { useAppSelector } from '../../hooks';
import { selectActivePlayer, selectPlayers } from "../../reducers";
import styles from './styles.scss';

const Component = Model(withStyles<IProps>(View, styles));

const Sidebar: React.FunctionComponent<any> = () => {
    const activePlayer = useAppSelector(selectActivePlayer);
    const players = useAppSelector(selectPlayers);

    return <Component activePlayer={activePlayer} players={players}/>
};

Sidebar.displayName = 'Sidebar';

export default Sidebar;
