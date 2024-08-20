import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { IGameState, Letters, ITimer, IPlayer, UserId } from '../../types';
import { deepClone } from '../helpers/object';

const initialState: IGameState | Record<string, any> = {
    timer: {
        time: 120,
        total: 120
    },
    players: {}
};

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        updateLetters: (state, action: PayloadAction<Letters>) => {
            state.letters = deepClone(action.payload);
        },
        updateActivePlayer: (state, action: PayloadAction<UserId> ) => {
            state.activePlayer = action.payload;
        },
        updatePlayers: (state, action: PayloadAction<Record<string, IPlayer>>) => {
            state.players = action.payload;
        },
        updateTimer: (state, action: PayloadAction<ITimer>) => {
            state.timer = action.payload;
        }
    },
});

export const { updateLetters, updateTimer, updateActivePlayer, updatePlayers } = gameSlice.actions;

export const selectLetter = (state: { game: IGameState | Record<string, any> }, letterId: string) => state?.game?.letters[letterId];
export const selectTimer = (state:  { game: IGameState | Record<string, any> }) => state?.game?.timer;
export const selectActivePlayer = (state: {game: IGameState | Record<string, any>}) => state.game.activePlayer
export const selectPlayers = (state:  {game: IGameState | Record<string, any>}) => state?.game?.players;

export const gameReducer = gameSlice.reducer;
