import React from 'react';
import clsx from 'clsx';
import uuid4 from 'uuid4';
import Label from '../Label/index';

export interface IProps {
	classes: Record<string, string>;
	disabled?: boolean;
	invalid?: boolean;
	placeholder?: string;
	className?: string;
	value: string;
	onChange: (e: any) => void;
	label?: string;
	hint?: string;
}

function InputView({
	classes,
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
			<Label className={classes.inputLabel} disabled={disabled}>
				{label}
			</Label>
			<input
				id={inputId}
				type="text"
				disabled={disabled}
				onChange={onChange}
				className={clsx(
					classes.input,
					'default-focusable',
					{ [classes.invalid]: invalid },
					{ 'default-focusable-invalid': invalid },
				)}
				placeholder={placeholder}
				value={value}
				{...rest}
			/>
			<Label className={classes.inputLabel} invalid={invalid} disabled={disabled}>
				{hint}
			</Label>
		</label>
	);
}

InputView.defaultProps = {
	disabled: false,
	invalid: false,
	className: '',
	hint: '',
	label: '',
	placeholder: '',
};

export default InputView;
