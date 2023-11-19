import React from 'react';
import clsx from 'clsx';

export interface IProps {
	disabled?: boolean;
	invalid?: boolean;
	classes: Record<string, string>;
	children: string | React.ReactElement;
	paddingType?: 'none' | 'small' | 'mid';
}

function HintView({ classes, children, disabled, invalid, paddingType }: IProps) {
	if (!children) {
		return null;
	}

	return (
		<div
			className={clsx(classes.hint, paddingType !== 'none' ? classes[`padding-${paddingType}`] : '', {
				[classes.disabled]: disabled,
				[classes.invalid]: invalid,
			})}
		>
			{children}
		</div>
	);
}

HintView.defaultProps = {
	disabled: false,
	invalid: false,
	paddingType: 'none',
};

export default HintView;
