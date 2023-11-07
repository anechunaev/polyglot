import * as React from 'react';
import Model from './model';
import View from './view';
import type { IProps as ILetterProps } from '../Letter/view';
import type { IProps } from './view';

const DraggableLetter = Model(React.forwardRef<unknown, ILetterProps & IProps>(View));

DraggableLetter.displayName = 'DraggableLetter';

export default DraggableLetter;
