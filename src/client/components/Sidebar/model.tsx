import * as React from 'react';
import type { IGameState } from '../../../types';
import { IProps as IViewProps } from './view';

export interface IProps {
	activePlayer?: IGameState["activePlayer"],
	players: IGameState["players"]
}

function Model(View: React.ComponentType<IViewProps>): React.ComponentType<IProps> {
	function SidebarModel(props: IProps) {
		return <View {...props} />;
	}

	SidebarModel.displayName = 'SidebarModel';

	return SidebarModel;
}

export default Model;
