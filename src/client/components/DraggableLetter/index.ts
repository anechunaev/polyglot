import * as React from 'react';
import Model from './model';
import View from './view';

const DraggableLetter = Model(React.forwardRef(View));

DraggableLetter.displayName = 'DraggableLetter';

export default DraggableLetter;
