import * as React from 'react';
import { EVENTS } from '../../../constants';
import type { IProps as IViewProps } from './view';
import type { IGameState, IUser, ITimer } from '../../../types';
import { useAppDispatch } from '../../hooks';
import { updateLetters, updateTimer, updateActivePlayer, updatePlayers } from '../../reducers';

export interface IProps {
	eventBus: any;
}

function Model(View: React.ComponentType<Omit<IViewProps, 'classes'>>): React.ComponentType<IProps> {
	function GameModel({ eventBus }: IProps) {
		const [user, setUser] = React.useState<IUser | null>(null);
		const [gameId, updateGameid] = React.useState<string>();
		const [gameState, updateGameState] = React.useState<IGameState | null>(null);
		const dispatch = useAppDispatch();

		React.useEffect(() => {
			eventBus.emit(EVENTS.GET_CURRENT_USER);
		}, [eventBus]);

		const loadGame = (payload: any) => {
			const data: {game: IGameState; gameId: string} = JSON.parse(payload);

			updateGameState(() => ({ ...data.game }));
			updateGameid(data.gameId);

			dispatch(updateLetters({ ...data.game.letters }));
			dispatch(updateActivePlayer(data.game.activePlayer));
			dispatch(updatePlayers(data.game.players));
		}

		eventBus.on(
			EVENTS.CREATE_GAME,
			React.useCallback(loadGame, []),
		);

		eventBus.on(
			EVENTS.GAME_SESSION_RECONNECT,
			React.useCallback(loadGame, []),
		)

		eventBus.on(
			EVENTS.GET_CURRENT_USER,
			React.useCallback((payload: IUser) => {
				setUser(() => payload);
			}, []),
		);

		eventBus.on(EVENTS.ON_TIMER_TICK,
			React.useCallback((payload: ITimer) => {
				dispatch(updateTimer(payload));
			}, [])
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
