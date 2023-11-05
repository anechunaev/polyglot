import View, { IProps as IViewProps } from './view';
import withStyles from '../withStyles';
import styles from './styles.scss';

const Container = withStyles<IViewProps>(View, styles);
Container.displayName = 'ShowcaseContainer';

export default Container;
