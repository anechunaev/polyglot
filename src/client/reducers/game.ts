import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { IGameState, Letters } from '../../types';
import {deepClone} from '../helpers/object';

const initialState: IGameState | Record<string, any> = {};

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        updateLetters: (state, action: PayloadAction<Letters>) => {
            state.letters = deepClone(action.payload);
        }
    },
});

export const { updateLetters } = gameSlice.actions;

export const selectLetter = (state: { game: IGameState |  Record<string, any> }, letterId: string) => state?.game?.letters[letterId];
export const gameReducer = gameSlice.reducer;