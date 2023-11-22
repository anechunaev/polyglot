import React from 'react';
import clsx from 'clsx';

export interface IProps {
	disabled?: boolean;
	invalid?: boolean;
	classes: Record<string, string>;
	className?: string;
	children: string | React.ReactElement;
}

function LabelView({ classes, className, children, invalid, disabled }: IProps) {
	if (!children) {
		return null;
	}

	return (
		<div
			className={clsx(classes.label, className, {
				[classes.disabled]: disabled,
				[classes.invalid]: invalid,
			})}
		>
			{children}
		</div>
	);
}

LabelView.defaultProps = {
	disabled: false,
	invalid: false,
	className: '',
};

export default LabelView;
