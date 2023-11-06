import View, { IProps as IViewProps } from './view';
import withStyles from '../withStyles';
import styles from './styles.scss';

const Cell = withStyles<IViewProps>(View, styles);
Cell.displayName = 'Cell';

export default Cell;
