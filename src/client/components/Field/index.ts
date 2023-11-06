import View, { IProps as IViewProps } from './view';
import withStyles from '../withStyles';
import styles from './styles.scss';

const Field = withStyles<IViewProps>(View, styles);
Field.displayName = 'Field';

export default Field;
