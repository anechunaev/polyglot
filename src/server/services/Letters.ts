export type LetterId = string;

export interface Letters {
    [id: LetterId]: {
        value: string,
        price: number;
        located: {
            in: "player"
        }
        | {
            in: "field",
            position: {
                x: number;
                y: number;
            }
        }
        | {
            in: "stock"
        }
    }
};

export interface ILetterConfig {
    name: string;
    count: number;
    price: number;
}

export const createLetterId = () => "letter_test_id_123";

export interface ILettersService {
    getLetters: () => Letters;
    getRandomLetters: (count: number) => LetterId[];
}

export class LettersService implements ILettersService {
    private state: Letters;

    constructor(config: ILetterConfig[]) {
        this.state = this.initState(config);
    }

    private initState(config: ILetterConfig[]) {
        const letters: Letters = {};

        while (config.length) {
            const letter = config.shift() as ILetterConfig;
            const id = createLetterId();

            letters[id] = {
                value: letter.name,
                price: letter.price,
                located: {
                    in: "stock"
                }

            }

            --letter.count;

            if (letter.count > 0) {
                config = [letter, ...config];
            }
        }

        return letters;
    }

    public getLetters () {
        return this.state;
    }

    public getRandomLetters(count: number) {
        const res: LetterId[] = [];
        const letters = Object.keys(this.state).filter(letterId => this.state[letterId].located.in === "stock");

        while (count) {
            const letterId = letters[Math.floor((Math.random()*letters.length))];
            const letter = this.state[letterId];
            letter.located.in = "player";

            this.state[letterId] = letter;
            res.push(letterId);
            --count;
        }

        return res;
    }
}