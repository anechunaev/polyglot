import * as React from 'react';

export interface IProps {
	disabled?: boolean;
	paddingType?: 'none' | 'small' | 'mid';
	children?: string | React.ReactElement;
}

function Model(View: React.ComponentType<IProps>): React.ComponentType<IProps> {
	function LabelModel({ children, ...rest }: IProps) {
		return <View {...rest}>{children}</View>;
	}

	LabelModel.defaultProps = {
		disabled: false,
		paddingType: 'none',
		children: '',
	};

	return LabelModel;
}

export default Model;
