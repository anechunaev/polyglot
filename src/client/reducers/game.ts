import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { IGameState, Letters, ITimer, IPlayer, UserId, Field, IWord } from '../../types';
// import { deepClone } from '../helpers/object';

const initialState: Partial<IGameState> = {
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
            state.allVisibleLettersMap = action.payload;
        },
        updateActivePlayer: (state, action: PayloadAction<UserId> ) => {
            state.activePlayer = action.payload;
        },
        updatePlayers: (state, action: PayloadAction<Record<string, IPlayer>>) => {
            state.players = action.payload;
        },
        updateTimer: (state, action: PayloadAction<ITimer>) => {
            state.timer = action.payload;
        },
        updateField: (state, action: PayloadAction<Field>) => {
            state.field = action.payload;
        },
        updateWords: (state, action: PayloadAction<IWord[]>) => {
            state.words = action.payload;
        },
        updateLetterDeck: (state, action: PayloadAction<{ letterId: string; deck: 'stock' | 'player' | 'field', position?: { x: number, y: number } }>) => {
            const { letterId, deck } = action.payload;
            const letter = state.allVisibleLettersMap?.[letterId];

            if (letter) {
                letter.located.in = deck;

                if (deck === 'field' && action.payload.position) {
                    (letter.located as any).position = action.payload.position;
                }
            }
        },
    },
});

export const { updateLetters, updateTimer, updateActivePlayer, updatePlayers, updateField, updateWords, updateLetterDeck } = gameSlice.actions;

export const selectLetter = (letterId: string) => (state: { game: IGameState }) => state?.game?.allVisibleLettersMap[letterId];
export const selectLetters = (state: { game: IGameState }) => state?.game.allVisibleLettersMap;
export const selectTimer = (state: { game: IGameState }) => state?.game?.timer;
export const selectActivePlayer = (state: { game: IGameState }) => state.game.activePlayer
export const selectPlayers = (state: { game: IGameState }) => state?.game?.players;
export const selectField = (state: { game: IGameState }) => state?.game.field;
export const selectWords = (state: { game: IGameState }) => state?.game.words;

export const gameReducer = gameSlice.reducer;
