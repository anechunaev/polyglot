import Model from './model';
import View, { IProps as IViewProps } from "./view";
import withStyles from "../withStyles";
import styles from './styles.scss';

const Timer = Model(withStyles<IViewProps>(View, styles));
Timer.displayName = "Timer";

export default Timer;
