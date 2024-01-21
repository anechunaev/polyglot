import uuid4 from "uuid4";
import type { Emit } from '../server/controller';
import { ITimerInstance , Timer } from '../server/services/Timer';
import type { ILettersService } from '../server/services/Letters';
import type {
    LetterId,
    Letters,
    UserId,
    GameId,
    Field,
    IPlayer,
    ISpectator,
    IUser
} from '../types';
import { generateFieldSchema } from './helpers';
import {
    EVENTS, DEFAULT_TIMER_VALUE_SEC,
    PLAYER_MAX_LETTERS_CAPACITY,
    PLAYER_DEFAULT_LETTERS_COUNT,
    ROLES
} from '../constants';
import { LettersService } from '../server/services/Letters';
import letterConfig from '../server/config/letters_rus.json';

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

export interface IWord {
    letters: LetterId[];
    position: {
        x: number;
        y: number;
    },
    type: 'vertical' | 'horizontal';
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

    constructor(emit: Emit, id: GameId, settings: IGameSettings, user: IUser) {
        const timer = new Timer(settings.timer || DEFAULT_TIMER_VALUE_SEC, this.onTimerTick, this.onTimerEnd);
        const letters = new LettersService(letterConfig);

        this.id = id;

        this.state = {
            active_player: user.id,
            players: {
                [user.id]: {
                    ...user,
                    letters: letters.getRandomLetters(PLAYER_DEFAULT_LETTERS_COUNT),
                    role: ROLES.PARTICIPANT,
                    score: 0
                }
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

        // if (secret !== player.secret) {
        //     console.error("Not a valid user for the current turn");
        // }
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
                            case "w3": word_multiplier += 3;
                            case "w2": word_multiplier += 2;
                            case "l3": letter.price *= 3;
                            case "l2": letter.price *= 2;
                        }
                        // each bonus could be used only once during the game
                        this.state.field[letter.located.position.y][letter.located.position.x] = null;
                    }

                    console.log('----LETTER.PRICE-----', score, letter.price, letter.value);
                    score += letter.price;
                    this.state.letters[letterId] = letter;
                });
                console.log('---SCORE-----', score, word_multiplier);
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

        this.emit(this.id, EVENTS.ON_NEXT_TURN, this.state);
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
        if (user.role === ROLES.SPECTATOR) {
            this.state.spectators.push(user);
        } else {
            this.state.players[user.id] = user;
        }
    }
}