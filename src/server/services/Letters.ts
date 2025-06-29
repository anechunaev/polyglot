import type { LetterId, Letters, Letter } from '../../types';

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
	private idToLetter: Map<LetterId, Letter> = new Map();
	private stock: LetterId[] = [];

	constructor(config: ILetterConfig[]) {
		config.forEach((letterConfig, index) => {
			for (let i = 0; i < letterConfig.count; i++) {
				const letterId = `${index}-${i}`;
				this.idToLetter.set(letterId, {
					id: letterId,
					value: letterConfig.name,
					price: letterConfig.price,
					located: {
						in: 'stock',
					},
				});
				this.stock.push(letterId);
			}
		});

		this.shuffle();
	}

	public getLetter(id: LetterId): Letter | undefined {
		return this.idToLetter.get(id);
	}

	public getLetters() {
		// return this.state;
		return {};
	}

	public getLetterByValue(value: string, deck?: 'stock' | 'player' | 'field'): Letter | undefined {
		for (const letter of this.idToLetter.values()) {
			if (deck && letter.located.in !== deck) {
				continue;
			}

			if (letter.value === value.toUpperCase()) {
				return letter;
			}
		}
		return undefined;
	}

	public shuffle() {
		this.stock = this.stock.sort(() => Math.random() - 0.5);
	}

	public putInDeck(deck: 'stock' | 'player' | 'field', letterId: LetterId, position?: { x: number, y: number }) {
		const letter = this.idToLetter.get(letterId);
		if (letter) {
			if (!letter.located) {
				letter.located = {
					in: 'stock',
				};
			}
			letter.located.in = deck;
			if (letter.located.in === 'field') {
				this.stock = this.stock.filter((id) => id !== letterId);
			}
			if (letter.located.in === 'stock') {
				this.stock.push(letterId);
			}
			if (letter.located.in === 'field' && position) {
				letter.located.position = position;
			} else {
				delete (letter.located as any).position;
			}
			this.idToLetter.set(letterId, letter);
		}
	}

	public getRandomLetters(count: number) {
		const letters = this.stock.splice(0, count);
		letters.forEach((letterId) => this.putInDeck('player', letterId));
		return letters;
	}

	// public putToStock(letterId: LetterId) {
	// 	this.putInDeck('stock', letterId);
	// 	this.stock.push(letterId);
	// }

	public setNeighbours(letterId: LetterId, neighbours: LetterId[]) {
		const letterObj = this.idToLetter.get(letterId);
		if (letterObj) {
			letterObj.located.neighbours = neighbours;
			this.idToLetter.set(letterId, letterObj);
		}
	}

	public getNeighbours(letterId: LetterId): LetterId[] | undefined {
		const letterObj = this.idToLetter.get(letterId);
		if (letterObj) {
			return letterObj.located.neighbours;
		}
		return undefined;
	}

	public clearNeighbours(letterId: LetterId) {
		const letterObj = this.idToLetter.get(letterId);
		if (letterObj) {
			delete letterObj.located.neighbours;
			this.idToLetter.set(letterId, letterObj);
		}
	}
}
