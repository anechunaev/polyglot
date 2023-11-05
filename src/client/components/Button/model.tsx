import * as React from 'react';

export interface IProps {
	children: string;
	onClick: () => void;
	disabled?: boolean;
	className?: string;
}

function Model(View: React.ComponentType<IProps>): React.ComponentType<IProps> {
	function ButtonModel({ children, ...rest }: IProps) {
		return <View {...rest}>{children}</View>;
	}

	ButtonModel.defaultProps = {
		disabled: false,
		className: '',
	};

	return ButtonModel;
}

export default Model;
