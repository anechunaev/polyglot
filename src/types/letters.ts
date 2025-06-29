export type LetterId = string;

export type Letter = {
	id: LetterId;
	value: string;
	price: number;
	located: {
		in: "player";
		neighbours?: LetterId[];
	}
	| {
		in: "field",
		position: {
			x: number;
			y: number;
		},
		neighbours?: LetterId[];
	}
	| {
		in: "stock";
		neighbours?: LetterId[];
	}
};

export interface Letters {
	[id: LetterId]: Letter;
};
