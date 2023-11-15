import * as React from 'react';
import {IProps as IViewProps} from './view';

export interface IProps {
	letterIds: (string | null)[];
}

function Model(View: React.ComponentType<IViewProps>): React.ComponentType<IProps> {
	function SidebarModel({letterIds}: IProps) {
		const [selectedLetters, setSelectedLetters] = React.useState<number[]>([]);

		const toogleSelected = (id: number) => {
			console.log('----toogleSelected-----', id);
			setSelectedLetters((state) => {
				const indexOf = state.indexOf(id);

				if (indexOf !== -1) {
					const newState = [...state];
					newState.splice(indexOf, 1);

					return newState;
				}
				return [...state, id];
			});
		};

		return <View letterIds={letterIds} onClick={toogleSelected} selectedLetters={selectedLetters} />;
	}

	SidebarModel.displayName = 'SidebarModel';

	return SidebarModel;
}

export default Model;
