import type { UserId, IPlayer, IUser, Letters, LetterId } from './index';

export type Field = (string | null)[][];

export type GameId = string;

export type ISearchParam = string;


export interface IWord {
	[position: string]: {
		letterIds: LetterId[];
		type: 'vertical' | 'horizontal';
		score?: number;
	};
}

export interface IGameState {
    active_player: UserId;
    players: {
        [playerId: string]: IPlayer
    };
    spectators: IUser[];
    letters: Letters;
    id: GameId;
    words?: IWord[];
    field: Field
    timer: {
        time: number;
        total: number;
    };
}
