import type { LetterId, Letters, ILettersService } from './Letters';
import { PLAYER_DEFAULT_LETTERS_COUNT } from '../../constants';
import uuid4 from "uuid4";

export type UserId = string;

export interface IUser {
    id: UserId;
    name: string;
};

export interface IPlayer extends User {
    role: "participant";
    secret?: string;
    score: number;
    letters: LetterId[];
};

export interface ISpectator extends User {
    role: "spectator";
}

export class User implements IUser {
    public id: UserId;
    public name: string;

    constructor(name: string) {
        this.id = uuid4();
        this.name = name;
    }
};

export class Player extends User implements IPlayer {
    public letters: LetterId[];
    public name: string;
    public role: 'participant';
    public secret?: string;
    public score: number;

    constructor(letters: ILettersService, name: string, secret?: string) {
        super(name);

        this.name = name;
        this.letters = letters.getRandomLetters(PLAYER_DEFAULT_LETTERS_COUNT);
        this.role = "participant";
        this.secret = secret;
        this.score = 0;
    }
};

export class Spectator extends User implements ISpectator {
    public role: "spectator";

    constructor(name: string) {
        super(name);

        this.role = "spectator";
    }
};
