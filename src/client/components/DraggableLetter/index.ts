import * as React from 'react';
import Model from './model';
import View, {IEncapsulatedProps, IProps} from './view';
import type { IProps as IModelProps} from './model';
import type { IProps as ILetterModelProps } from '../Letter/model';
import withStyles from '../withStyles';
import styles from './styles.scss';

const DraggableLetter = Model(withStyles(React.forwardRef<unknown, IProps & ILetterModelProps & IEncapsulatedProps>(View), styles));

DraggableLetter.displayName = 'DraggableLetter';

export default DraggableLetter;
