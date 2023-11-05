import * as React from 'react';

export interface IProps {
	children: string;
	onClick: () => void;
	disabled?: boolean;
	className?: string;
}

function Model(View: React.ComponentType<IProps>): React.ComponentType<IProps> {
	function ButtonModel({ children, onClick, disabled, className }: IProps) {
		return (
			<View onClick={onClick} disabled={disabled} className={className}>
				{children}
			</View>
		);
	}

	ButtonModel.defaultProps = {
		disabled: false,
		className: '',
	};

	return ButtonModel;
}

export default Model;
