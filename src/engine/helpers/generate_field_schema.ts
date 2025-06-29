import type { Field, Cell } from '../../types';

// @TODO: write an algorythm for dynamic creating field schema
export const generateFieldSchema = (): Field => [
	['w3', null, null, 'l2', null, null, null, 'w3', null, null, null, 'l2', null, null, 'w3'],
	[null, 'w2', null, null, null, 'l3', null, null, null, 'l3', null, null, null, 'w2', null],
	[null, null, 'w2', null, null, null, 'l2', null, 'l2', null, null, null, 'w2', null, null],
	['l2', null, null, 'w2', null, null, null, 'l2', null, null, null, 'w2', null, null, 'l2'],
	[null, null, null, null, 'w2', null, null, null, null, null, 'w2', null, null, null, null],
	[null, 'l3', null, null, null, 'l3', null, null, null, 'l3', null, null, null, 'l3', null],
	[null, null, 'l2', null, null, null, 'l2', null, 'l2', null, null, null, 'l2', null, null],
	['w3', null, null, 'l2', null, null, null, null, null, null, null, 'l2', null, null, 'w3'],
	[null, null, 'l2', null, null, null, 'l2', null, 'l2', null, null, null, 'l2', null, null],
	[null, 'l3', null, null, null, 'l3', null, null, null, 'l3', null, null, null, 'l3', null],
	[null, null, null, null, 'w2', null, null, null, null, null, 'w2', null, null, null, null],
	['l2', null, null, 'w2', null, null, null, 'l2', null, null, null, 'w2', null, null, 'l2'],
	[null, null, 'w2', null, null, null, 'l2', null, 'l2', null, null, null, 'w2', null, null],
	[null, 'w2', null, null, null, 'l3', null, null, null, 'l3', null, null, null, 'w2', null],
	['w3', null, null, 'l2', null, null, null, 'w3', null, null, null, 'l2', null, null, 'w3'],
].map(row => row.map(bonus => ({ bonus, letterId: null }) as Cell));
