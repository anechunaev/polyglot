import View, { IProps as IViewProps } from './view';
import withStyles from '../withStyles';
import styles from './styles.scss';

const Letter = withStyles<IViewProps>(View, styles);
Letter.displayName = 'Letter';

export default Letter;
