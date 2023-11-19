import React from 'react';
import clsx from 'clsx';

export interface IProps {
	disabled?: boolean;
	classes: Record<string, string>;
	children: string | React.ReactElement;
	paddingType?: 'none' | 'small' | 'mid';
}

function LabelView({ classes, children, disabled, paddingType }: IProps) {
	if (!children) {
		return null;
	}

	return (
		<div
			className={clsx(classes.label, paddingType !== 'none' ? classes[`padding-${paddingType}`] : '', {
				[classes.disabled]: disabled,
			})}
		>
			{children}
		</div>
	);
}

LabelView.defaultProps = {
	disabled: false,
	paddingType: 'none',
};

export default LabelView;
