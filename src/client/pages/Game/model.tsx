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
	// @todo: подключить шину событий в контроллере
	function GameModel({ eventBus }: IProps) {
		const [user, setUser] = React.useState<IUser | null>(null);
		const [gameId, updateGameid] = React.useState<string>();
		const [field, updateField] = React.useState<any>();
		const [fieldLetters, updateFieldLetters] = React.useState<string[]>([]);
		const [gameState, updateGameState] = React.useState<IGameState | null>(null);
		const dispatch = useAppDispatch();

		React.useEffect(() => {
			setUser({ id: '7301cf16-5e08-4019-bf84-734d3d73f7bd', name: 'jpig' });
		}, []);

		const loadGame = (payload: any) => {
			const data: { game: IGameState; gameId: string } = JSON.parse(payload);

			updateGameState(() => ({ ...data.game }));
			updateField(data.game.field);
			updateFieldLetters(data.game.turn.droppedLetters)
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
			React.useCallback((payload: {data: ITimer}) => {
				dispatch(updateTimer(payload.data));
			}, [])
		);

		eventBus.on(EVENTS.UPDATE_FIELD, React.useCallback((payload: any) => {
			updateField(payload.field);
		}, []));

		eventBus.on(EVENTS.UPDATE_TURN_FIELD, React.useCallback((payload: any) => {
			updateField(payload.field);
		}, []));

		eventBus.on(EVENTS.UPDATE_TURN_LETTERS, React.useCallback((payload: any) => {
			updateFieldLetters(payload.dropppedLetters);
		}, []));

		const onCreateGame = () => {
			eventBus.emit(EVENTS.CREATE_GAME, {
				settings: {
					max_players: 2,
				},
				user,
			});
		};

		const onAddLetter = (payload: any) => {
			eventBus.emit(EVENTS.ADD_LETTER, payload);
		};
		const onRemoveLetter = (payload: any) => {
			eventBus.emit(EVENTS.REMOVE_LETTER, payload);
		};

		if (!user) {
			return null;
		}

		return <View game={gameState} fieldLetters={fieldLetters} field={field} userId={user!.id} onCreateGame={onCreateGame} onAddLetter={onAddLetter} onRemoveLetter={onRemoveLetter} />;
	}

	GameModel.displayName = 'GameModel';
	GameModel.defaultProps = {};

	return GameModel;
}

export default Model;
