import * as React from 'react';

export interface IProps {
	disabled?: boolean;
	paddingType?: 'none' | 'small' | 'mid';
	invalid?: boolean;
	children?: string | React.ReactElement;
}

function Model(View: React.ComponentType<IProps>): React.ComponentType<IProps> {
	function HintModel({ children, ...rest }: IProps) {
		return <View {...rest}>{children}</View>;
	}

	HintModel.defaultProps = {
		disabled: false,
		invalid: false,
		paddingType: 'none',
		children: '',
	};

	return HintModel;
}

export default Model;
