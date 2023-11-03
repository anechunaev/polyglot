import * as React from 'react';

export interface IProps {
	children: string;
	onClick: () => void;
	disabled?: boolean;
}

function Model(View: React.ComponentType<IProps>): React.ComponentType<IProps> {
	function ButtonModel({ children, onClick, disabled }: IProps) {
		return (
			<View onClick={onClick} disabled={disabled}>
				{children}
			</View>
		);
	}

	ButtonModel.defaultProps = {
		disabled: false,
	};

	return ButtonModel;
}

export default Model;
