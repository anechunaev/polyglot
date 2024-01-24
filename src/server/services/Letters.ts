import type { LetterId, Letters } from '../../types';

export interface ILetterConfig {
    name: string;
    count: number;
    price: number;
}

export interface ILettersService {
    getLetters: () => Letters;
    getRandomLetters: (count: number) => LetterId[];
}

export class LettersService implements ILettersService {
    private state: Letters;

    constructor(config: ILetterConfig[]) {
        this.state = this.initState([...config]);
    }

    private initState(config: ILetterConfig[]) {
        const letters: Letters = {};
        let index = 0;

        while (config.length) {
            const letter = config.shift() as ILetterConfig;

            letters[index] = {
                value: letter.name,
                price: letter.price,
                located: {
                    in: "stock"
                }

            }

            index++;

            --letter.count;

            if (letter.count > 0) {
                config = [letter, ...config];
            }
        }

        return letters;
    }

    public getLetters() {
        return this.state;
    }

    public getRandomLetters(count: number) {
        const res: LetterId[] = [];
        while (count) {
            const letters = Object.keys(this.state).filter(letterId => {
                console.log('---this.state[letterId]------', this.state[letterId]);

                return this.state[letterId].located.in === "stock";
            });
    
            const letterId = letters[Math.floor((Math.random() * letters.length))];
            const letter = this.state[letterId];
            console.log('---ERROR ---', letter, letterId, this.state )
            letter.located.in = "player";

            this.state[letterId] = letter;
            res.push(letterId);
            --count;
        }

        return res;
    }
}