import Model from './model';
import View, { IProps as IViewProps } from "./view";
import withStyles from "../withStyles";
import styles from './styles.scss';

const GameList = Model(withStyles<IViewProps>(View, styles));

export default GameList;
