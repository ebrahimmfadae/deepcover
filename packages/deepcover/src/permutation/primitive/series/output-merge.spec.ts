import { optional } from '#src/permutation/modifiers/optional';
import { each } from '#src/permutation/primitive/each/each';
import { record } from '#src/permutation/primitive/record/record';
import { series } from '#src/permutation/primitive/series/series';
import { inspect } from 'node:util';

describe('optional', () => {
	test('none-optional', () => {
		const a = optional(series(record({ b: each(1) })));
		const b = series(each(8, 9), record({ c: each(3, 4) }));
		for (const element of a.outputMerge(b)) {
			console.log(element);
		}
	});
});

describe('none-optional', () => {
	test('optional', () => {
		const a = series(each(1, 2), record({ b: each(1) }));
		const b = optional(series(each(8, 9), record({ c: each(3, 4) }), record([each(5, 6)])));
		for (const element of a.outputMerge(b)) {
			console.log(element);
		}
	});
});

describe('optional', () => {
	test('optional', () => {
		const a = optional(series(each(1, 2), record({ b: each(1) })));
		const b = optional(series(each(8, 9), record({ c: each(3, 4) }), record([each(5, 6)])));
		for (const element of a.outputMerge(b)) {
			console.log(element);
		}
	});
});

const a = {
	d: 4,
	c: [{ b: 3, a: 2 }],
	b: { z: 5, i: 7 },
	a: 7,
};
const b = eval(`(${inspect(a, { sorted: true })})`);
console.log(b);
