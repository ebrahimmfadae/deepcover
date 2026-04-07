import { each } from '#src/permutation/primitive/each/each';
import { record } from '#src/permutation/primitive/record/record';
import { series } from '#src/permutation/primitive/series/series';

describe('a', () => {
	test('b', () => {
		const a = series(record({ a: each(5, 6) }));
		const b = series(record({ a: each(5, 6, 7) }), record({ a: each(5, 6, 9) }));
		expect(a.subSchemaOf(b)).toBe(true);
	});
});

describe('a', () => {
	test('b', () => {
		const a = series(each(1, 2), record({ a: each(5, 6) }));
		const b = series(each(1, 2, 3, 4), record({ a: each(5, 6, 7) }));
		expect(a.subSchemaOf(b)).toBe(true);
	});
});
