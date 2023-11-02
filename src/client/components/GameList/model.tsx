import * as React from 'react';
import type { IProps as IViewProps } from './view';
import { EventBus } from '../../services/eventBus';
import { EVENTS } from '../../../constants';

export interface IProps {}

function Model(View: React.ComponentType<IViewProps>): React.ComponentType<IProps> {
	return function GameListModel() {
		const [gameList, updateGameList] = React.useState<string[]>([]);
		const eventBus = React.useMemo(() => new EventBus(), []);

		eventBus.connect();

		eventBus.on(EVENTS.CREATE_GAME, (payload: any) => {
			// eslint-disable-next-line no-console
			console.log('New game was created with state', payload);
		});

		eventBus.on(EVENTS.UPDATE_GAME_LIST, (payload: string[]) => {
			updateGameList(payload);
		});

		const onCreateGame = React.useCallback(() => {
			eventBus.emit(EVENTS.CREATE_GAME, {
				game: {
					settings: {
						max_players: 2,
					},
					player: {
						name: 'jpig',
					},
				},
			});
		}, [eventBus]);

		return <View onCreateGame={onCreateGame} gameList={gameList} />;
	};
}

export default Model;
