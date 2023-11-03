import type { Emit } from './GameManager';
import uuid4 from "uuid4";
import { ITimerInstance } from './Timer';
import type { LetterId, Letters, ILettersService } from './Letters';
import type { Field } from './helpers/generate_field_schema';
import type { UserId, IPlayer, ISpectator, IUser } from './User';
import { Player } from './User';
import { generateFieldSchema } from './helpers/generate_field_schema';
import { EVENTS, DEFAULT_TIMER_VALUE_SEC } from '../../constants';
import { PLAYER_MAX_LETTERS_CAPACITY } from '../../constants';
import { Timer } from './Timer';
import { LettersService } from './Letters';
import letterConfig from '../config/letters_rus.json';
export type GameId = string;

export interface IGameSettings {
    timer: number;
    max_score: number;
};


export interface Word {
    letters: LetterId[];
    type: "vertical" | "horizontal";
    position: {
        x: number;
        y: number;
    }
};

export interface Turn {
    playerId: UserId;
    words: Word[];
};

export interface IState {
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

export interface IGame {
    nextTurn: (turn: Turn, secret: string) => void;
    start: () => void;
    emit: Emit;
    canJoin: (max_players: number) => boolean;
    join: (player: ISpectator | IPlayer, pwd?: string) => void;
    getState: () => IState;
};

export class GameEngine implements IGame {
    private state: IState;
    private timer: ITimerInstance;
    private letters: ILettersService;
    private id: GameId;
    private max_score: number;

    public emit: Emit;

    constructor(emit: Emit, id: GameId, settings: IGameSettings, playerName: IPlayer["name"]) {
        const timer = new Timer(settings.timer || DEFAULT_TIMER_VALUE_SEC, this.onTimerTick, this.onTimerEnd);
        const letters = new LettersService(letterConfig);

        const player = new Player(letters, playerName);

        this.id = id;

        this.state = {
            active_player: player.id,
            players: {
                [player.id]: player
            },
            spectators: [],
            letters: letters.getLetters(),
            field: generateFieldSchema(),
            timer: {
                time: settings.timer,
                total: settings.timer
        
            }
        };

        this.timer = timer;
        this.letters = letters;
        this.max_score = settings.max_score;
        this.emit = emit;
    }

    public start() {
        this.timer.start();
    }

    public onTimerEnd() {
        this.nextTurn(
            {
                playerId: this.state.active_player,
                words: []
            },
            this.state.players[this.state.active_player].secret!
        )
    }

    private getNextPlayerId() {
        const players = Object.keys(this.state.players);
        const current_player_index = players.indexOf(this.state.active_player);

        const next_player_index = (current_player_index + 1) % players.length;

        return players[next_player_index];

    }

    public nextTurn(turn: Turn, secret: string) {
        const player = this.state.players[turn.playerId];

        if (secret !== player.secret) {
            console.error("Not a valid user for the current turn");
        }
        const new_secret = uuid4();

        if (turn.words.length) {

            turn.words.forEach(word => {
                let score = 0;
                let word_multiplier = 0;
                const { letters, position, type } = word;

                letters.forEach((letterId, index) => {
                    const letter = this.state.letters[letterId];

                    letter.located = {
                        in: "field",
                        position: {
                            x: type === "horizontal" ? position.x + index : position.x,
                            y: type === "vertical" ? position.y + index : position.y
                        }
                    };
                    const field_bonus = this.state.field[letter.located.position.y][letter.located.position.x];

                    if (field_bonus) {
                        switch (field_bonus) {
                            case "w3": word_multiplier + 3;
                            case "w2": word_multiplier + 2;
                            case "l3": letter.price * 3;
                            case "l2": letter.price * 2;
                        }
                    }

                    score += letter.price;
                    this.state.letters[letterId] = letter;
                });

                if (word_multiplier) {
                    score *= word_multiplier;
                }

                this.state.players[turn.playerId].score += score;
            });
        }

        player.secret = new_secret;

        const letters_count = PLAYER_MAX_LETTERS_CAPACITY - player.letters.length;

        if (letters_count) {
            const letterIds = this.letters.getRandomLetters(letters_count);

            player.letters = [...player.letters, ...letterIds];
        }

        this.state.active_player = this.getNextPlayerId();

        this.state.players[turn.playerId] = player;

        if (player.score >= this.max_score) {
            this.finish(player);
        }
    }

    public onTimerTick = (time: number, total: number) => {
        this.emit(this.id, EVENTS.ON_TIMER_TICK, { time, total });
    }

    public getState() {
        return this.state;
    }

    public finish(player?: IPlayer) {
        this.emit(this.id, EVENTS.ON_FINISH_GAME, { winner: { name: player?.name, score: player?.score } });
    }

    public canJoin(max_players: number) {
        return !(max_players === Object.keys(this.state.players).length);
    }

    public join(user: ISpectator | IPlayer) {
        if (user.role === "spectator") {
            this.state.spectators.push(user);
        } else {
            this.state.players[user.id] = user;
        }
    }
}