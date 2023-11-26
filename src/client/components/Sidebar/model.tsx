import * as React from 'react';
import { IProps as IViewProps } from './view';

export interface IProps {}

function Model(View: React.ComponentType<IViewProps>): React.ComponentType<IProps> {
	function SidebarModel() {
		return <View />;
	}

	SidebarModel.displayName = 'SidebarModel';

	return SidebarModel;
}

export default Model;
