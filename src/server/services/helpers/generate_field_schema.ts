export interface Size {
    x: number;
    y: number;
}

export type Field = (string | null)[][];

// @TODO: write an algorythm for dynamic creating field schema
export const generateFieldSchema = (): Field => {
    return [
        ["w3", null, null, "l2", null, null, null, "w3", null, null, null, "l2", null, null, "w3"],
        [null, "w2", null, null, null, "l3", null, null, null, "l3", null, null, null, "w2", null],
        [null, null, "w2", null, null, null, "l2", null, "l2", null, null, null, "w2", null, null],
        ["l2", null, null, "w2", null, null, null, "l2", null, null, null, "w2", null, null, "l2"],
        [null, null, null, null, "w2", null, null, null, null, null, "w2", null, null, null, null],
        [null, "l3", null, null, null, "l3", null, null, null, "l3", null, null, null, "l3", null],
        [null, null, "l2", null, null, null, "l2", null, "l2", null, null, null, "l2", null, null],
        ["w3", null, null, "l2", null, null, null, null, null, null, null, "l2", null, null, "w3"],
        [null, null, "l2", null, null, null, "l2", null, null, null, null, null, "l2", null, null],
        [null, "l3", null, null, null, "l3", null, null, null, "l3", null, null, null, "l3", null],
        [null, null, null, null, "w2", null, null, null, null, null, "w2", null, null, null, null],
        ["l2", null, null, "w2", null, null, null, "l2", null, null, null, "w2", null, null, "l2"],
        [null, null, "w2", null, null, null, "l2", null, "l2", null, null, null, "w2", null, null],
        [null, "w2", null, null, null, "l3", null, null, null, "l3", null, null, null, "w2", null],
        ["w3", null, null, "l2", null, null, null, "w3", null, null, null, "l2", null, null, "w3"]
    ]
}
