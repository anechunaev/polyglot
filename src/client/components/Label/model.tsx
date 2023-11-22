import * as React from 'react';

export interface IProps {
	disabled?: boolean;
	invalid?: boolean;
	className?: string;
	children?: string | React.ReactElement;
}

function Model(View: React.ComponentType<IProps>): React.ComponentType<IProps> {
	function LabelModel({ children, ...rest }: IProps) {
		return <View {...rest}>{children}</View>;
	}

	LabelModel.defaultProps = {
		disabled: false,
		invalid: false,
		className: '',
		children: '',
	};

	return LabelModel;
}

export default Model;
