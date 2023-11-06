import * as React from 'react';
import data from './data.json';

const { letters } = (data as any).players[data.active_player];

export interface IProps {
	letters: string[];
	onClick: (id: number) => void;
	selectedCells: number[];
}

function Model(View: React.ComponentType<IProps>): React.ComponentType {
	function SidebarModel() {
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

		return <View letters={letters} onClick={toogleSelected} selectedCells={selectedCells} />;
	}

	return SidebarModel;
}

export default Model;
