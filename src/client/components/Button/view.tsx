import React from 'react';
import clsx from 'clsx';
import { IProps } from './model';

function ButtonView({ classes, onClick, disabled, children }: IProps) {
	return (
		<button
			type="button"
			className={clsx(classes.container, 'default-focusable')}
			disabled={disabled}
			onClick={onClick}
		>
			{children}
		</button>
	);
}

export default ButtonView;
