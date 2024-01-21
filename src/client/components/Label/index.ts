import Model, { IProps } from './model';
import View from './view';
import withStyles from '../withStyles';
import styles from './styles.scss';

const Label = Model(withStyles<IProps>(View, styles));

export default Label;
