import * as React from 'react';
import { IProps as IViewProps } from './view';

export type IProps = Omit<IViewProps, 'classes'>;

function Model(View: React.ComponentType<IProps>): React.ComponentType<IProps> {
	function InputModel(props: Omit<IProps, 'value'>) {
		const [value, setValue] = React.useState('');

		const onInputChange = (e: any) => {
			setValue(e.target?.value);

			props.onChange?.(value);
		};

		return <View {...props} value={value} onChange={onInputChange} />;
	}

	InputModel.defaultProps = {
		disabled: false,
		invalid: false,
		placeholder: '',
		defaultValue: '',
		className: '',
		label: '',
		hint: '',
	};

	return InputModel;
}

export default Model;
