const INITIAL_WORD_LENGTH = 7;

export interface IConfig {
    lang: string
}

export interface IDictionary{
	load: () => Promise<void>;
	getInitialWord: () => string;
    checkWord: (word: string) => boolean;
}

export class Dictionary {
    public dictionary: Set<string>;
    public initialWords: any;

    constructor({lang}: IConfig = {lang: 'ru'}) {
        this.dictionary = new Set<string>();
        this.initialWords = [];
    }

    load = async () => {
        const data = (await import('./ru.json')).default;

        for (let i = 0; i < data.length; i++) {
            const word = data[i];
            this.dictionary.add(word);

            if (word.length !== INITIAL_WORD_LENGTH) {
                continue;
            }

            this.initialWords.push(word);
        }
    }

    getInitialWord() {
        const word = this.initialWords[Math.floor(Math.random() * this.initialWords.length)];

        return word;
    }

    checkWord(word: string) {
        return this.dictionary.has(word);
    }
}
