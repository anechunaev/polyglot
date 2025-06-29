import type { UserId, IPlayer, IUser, Letters, LetterId } from './index';

export type Cell = {
	bonus: 'l2' | 'w2' | 'l3' | 'w3' | null;
	letterId: LetterId | null;
}

export type Field = Cell[][];

export type GameId = string;

export type ISearchParam = string;

export interface IAddLetter {
	letterId: string;
	position: {
		x: number;
		y: number;
	};
}

export interface IRemoveLetter {
	letterId: string;
}

export interface ITimer {
	time: number;
	total: number;
}

export interface IWord {
	start: string;
	letterIds: LetterId[];
	kind: 'vertical' | 'horizontal';
	score?: number;
	isValid?: boolean;
	isPrevious?: boolean;
	renderedWord: string;
}

export interface IWords {
	[id: string]: IWord;
}

export interface IGameState {
	activePlayer: UserId;
	players: {
		[playerId: string]: IPlayer;
	};
	spectators: IUser[];
	letters: Letters;
	id: GameId;
	words?: IWord[];
	field: Field;
	timer: ITimer;
	turn?: {
		droppedLetters: string[];
		words: IWords;
	};
	allVisibleLettersMap: Letters;
}
