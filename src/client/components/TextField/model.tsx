import * as React from 'react';

export interface IProps {
	icon?: React.ReactElement | null;
	disabled?: boolean;
	invalid?: boolean;
	placeholder?: string;
	className?: string;
	onChange: () => void;
	label?: string;
	hint?: string;
	value?: string;
}

function Model(View: React.ComponentType<IProps>): React.ComponentType<IProps> {
	function TextFieldModel({ children, onChange: onChangeProp, ...rest }: IProps) {
		const [value, setValue] = React.useState<string>('');

		const onChange = (e) => {
			setValue(e.target.value);
			onChangeProp();
		};

		return (
			<View value={value} onChange={onChange} {...rest}>
				{children}
			</View>
		);
	}

	TextFieldModel.defaultProps = {
		disabled: false,
		invalid: false,
		placeholder: '',
		className: '',
		icon: null,
		label: '',
		hint: '',
		value: '',
	};

	return TextFieldModel;
}

export default Model;
