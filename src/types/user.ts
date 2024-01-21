import type { LetterId } from './index';

export type UserId = string;

export interface IRroles {
    PARTICIPANT: 'PARTICIPANT',
    SPECTATOR: 'SPECTATOR'
}

export interface IPlayer extends IUser {
    role: IRroles["PARTICIPANT"];
    secret?: string;
    score: number;
    letters: LetterId[];
};

export interface ISpectator extends IUser {
    role: IRroles["SPECTATOR"];
}

export interface IUser {
    id: UserId;
    name: string;
};
