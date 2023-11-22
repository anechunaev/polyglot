import * as React from 'react';

export interface IProps {
	disabled?: boolean;
	invalid?: boolean;
	placeholder?: string;
	className?: string;
	onChange: (e: any) => void;
	label?: string;
	hint?: string;
	value?: string;
}

function Model(View: React.ComponentType<IProps>): React.ComponentType<IProps> {
	function InputModel({ children, ...rest }: IProps) {
		return <View {...rest}>{children}</View>;
	}

	InputModel.defaultProps = {
		disabled: false,
		invalid: false,
		placeholder: '',
		className: '',
		label: '',
		hint: '',
		value: '',
	};

	return InputModel;
}

export default Model;
