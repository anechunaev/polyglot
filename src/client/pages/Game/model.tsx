import * as React from 'react';
import { EVENTS } from '../../../constants';
import type { IProps as IViewProps } from './view';
import type { IGameState, IUser } from '../../../types';

export interface IProps {
	eventBus: any;
}

function Model(View: React.ComponentType<Omit<IViewProps, 'classes'>>): React.ComponentType<IProps> {
	function GameModel({ eventBus }: IProps) {
		const [user, setUser] = React.useState<IUser | null>(null);
		const [gameState, updateGameState] = React.useState<IGameState | null>(null);

		React.useEffect(() => {
			eventBus.emit(EVENTS.GET_CURRENT_USER);
		}, [eventBus]);

		eventBus.on(
			EVENTS.CREATE_GAME,
			React.useCallback((payload: any) => {
				// eslint-disable-next-line no-console

				const data = JSON.parse(payload);

				updateGameState(() => ({ ...data.game }));
			}, []),
		);

		eventBus.on(
			EVENTS.GET_CURRENT_USER,
			React.useCallback((payload: IUser) => {
				setUser(() => payload);
			}, []),
		);

		const onCreateGame = () => {
			eventBus.emit(EVENTS.CREATE_GAME, {
				settings: {
					max_players: 2,
				},
				user,
			});
		};

		if (!user) {
			return null;
		}

		return <View game={gameState} userId={user!.id} onCreateGame={onCreateGame} />;
	}

	GameModel.displayName = 'GameModel';
	GameModel.defaultProps = {};

	return GameModel;
}

export default Model;
