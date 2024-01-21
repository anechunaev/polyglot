import type { UserId, IPlayer, IUser, Letters } from './index';

export type Field = (string | null)[][];

export type GameId = string;

export interface IGameState {
    active_player: UserId;
    players: {
        [playerId: string]: IPlayer
    };
    spectators: IUser[];
    letters: Letters;
    field: Field
    timer: {
        time: number;
        total: number;
    };
}
