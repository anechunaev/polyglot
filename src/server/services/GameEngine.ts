import type { ITimerInstance } from './Timer';
import type { IServiceBus } from './ServiceBus';
import type { LetterId, Letters, ILettersService } from './Letters';

import { PLAYER_MAX_LETTERS_CAPACITY } from '../constants';
import { Timer } from './Timer';
import { LettersService } from './Letters';
import letterConfig from '../config/letters_rus.json';

export type UserId = string;
export type GameId = string;

export interface IGameSettings {
    timer: number;
    max_players: number;
    max_score: number;
    password?: string;
};

export interface User {
    id: UserId;
    role: string;
    nickname: string;
};

export interface Player extends User {
    role: "participant";
    secret: string;
    score: number;
    turn: number;
    letters: LetterId[];
};

export interface Spectator extends User {
    role: "spectator";
}

export interface Turn {
    playerId: UserId;
    score: number;
    words: string[];
};

export interface IState {
    game: {
        id: GameId;
        active_player: UserId;
        players: {
            [playerId: string]: Player
        };
        spectators: User[];
        letters: Letters;
    },
    timer: ITimerInstance;
}

export interface IGame {
    nextTurn: (turn: Turn, secret: string) => void;
    searchWord: () => void;
    join: (player: Spectator | Player, pwd?: string) => void;
    id: GameId;
    is_full: boolean;
    password?: string;
};

const createGameId = () => 'test_game_id_123';
const createId = () => 'test_id_123';
const createSecret = () => 'test_secret_123';

export class GameEngine implements IGame {
    private state: IState;
    private letters: ILettersService;
    private max_players: number;
    private max_score: number;

    public id: GameId;
    public password?: string;
    public is_full: boolean;

    constructor(seviceBus: IServiceBus, settings: IGameSettings, player: Player) {
        const timer = new Timer(settings.timer, this.onTimerTick, this.onTimerEnd);
        const letters = new LettersService(letterConfig);

        this.state = {
            game: {
                id: createGameId(),
                active_player: player.id,
                players: {
                    [player.id]: player
                },
                spectators: [],
                letters: letters.getLetters()
            },
            timer: timer
        };

        this.letters = letters;
        this.id = createId();
        this.password = settings.password;
        this.max_players = settings.max_players;
        this.max_score = settings.max_score;

        this.is_full = false;
    }

    private getNextPlayerId() {
        const players = Object.keys(this.state.game.players);
        const current_player_index = players.indexOf(this.state.game.active_player);

        const next_player_index = (current_player_index + 1) % players.length;

        return players[next_player_index];

    }

    public onTimerEnd() {
        this.nextTurn(
            {
                playerId: this.state.game.active_player,
                score: 0,
                words: []
            },
            this.state.game.players[this.state.game.active_player].secret
        )
    }

    public nextTurn(turn: Turn, secret: string) {
        const player = this.state.game.players[turn.playerId];

        if (secret !== player.secret) {
            console.error("Not valid user for the current turn");
        }
        const new_secret = createSecret();

        player.score += turn.score;
        player.secret = new_secret;

        const letters_count = PLAYER_MAX_LETTERS_CAPACITY - player.letters.length;

        if (letters_count) {
            const letterIds = this.letters.getRandomLetters(letters_count);

            player.letters = [...player.letters, ...letterIds];
        }

        this.state.game.active_player = this.getNextPlayerId();

        this.state.game.players[turn.playerId] = player;

        if (player.score >= this.max_score) {
            this.finish();
        }
    }

    public searchWord() { }
    public onTimerTick() { }

    public getState() {
        return this.state;
    }

    public finish() { }

    public join(user: Spectator | Player, password?: string) {
        if (user.role === "spectator") {
            this.state.game.spectators.push(user);
        } else {
            this.state.game.players[user.id] = user;
            this.is_full = this.max_players === Object.keys(this.state.game.players).length;
        }
    }
}