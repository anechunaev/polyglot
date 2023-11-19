import React from 'react';
import clsx from 'clsx';
import uuid4 from 'uuid4';
import Label from '../Label/index';
import Hint from '../Hint/index';

export interface IProps {
	classes: Record<string, string>;
	icon?: React.ReactElement | null;
	disabled?: boolean;
	invalid?: boolean;
	placeholder?: string;
	className?: string;
	value: string;
	onChange: (e: any) => void;
	label?: string;
	hint?: string;
}

function TextFieldView({
	classes,
	icon,
	disabled,
	invalid,
	placeholder,
	className,
	value,
	onChange,
	label,
	hint,
	...rest
}: IProps) {
	const inputId = uuid4();

	return (
		<label htmlFor={inputId} className={clsx(classes.wrapper, className)}>
			<Label paddingType="small" disabled={disabled}>
				{label}
			</Label>
			<input
				id={inputId}
				type="text"
				disabled={disabled}
				onChange={onChange}
				className={clsx(
					classes.textField,
					'default-focusable',
					{ [classes.invalid]: invalid },
					{ 'default-focusable-invalid': invalid },
				)}
				placeholder={placeholder}
				value={value}
				{...rest}
			/>
			<Hint paddingType="small" invalid={invalid} disabled={disabled}>
				{hint}
			</Hint>
		</label>
	);
}

TextFieldView.defaultProps = {
	disabled: false,
	invalid: false,
	icon: null,
	className: '',
	hint: '',
	label: '',
	placeholder: '',
};

export default TextFieldView;
