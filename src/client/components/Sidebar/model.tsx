import * as React from 'react';
import {IProps as IViewProps} from './view';

export interface IProps {
	letterIds: string[];
}

function Model(View: React.ComponentType<IViewProps>): React.ComponentType<IProps> {
	function SidebarModel({letterIds}: IProps) {
		const [selectedCells, setSelectedCells] = React.useState<number[]>([]);

		const toogleSelected = (id: number) => {
			setSelectedCells((state) => {
				const indexOf = state.indexOf(id);

				if (indexOf !== -1) {
					const newState = [...state];
					newState.splice(indexOf, 1);

					return newState;
				}
				return [...state, id];
			});
		};

		return <View letterIds={letterIds} onClick={toogleSelected} selectedCells={selectedCells} />;
	}

	return SidebarModel;
}

export default Model;
