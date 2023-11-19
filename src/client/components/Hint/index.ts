import Model, { IProps } from './model';
import withStyles from '../withStyles';
import styles from './styles.scss';
import View from './view';

const Hint = Model(withStyles<IProps>(View, styles));

export default Hint;
