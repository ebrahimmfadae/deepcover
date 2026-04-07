import { each } from '#src/permutation/primitive/each/each';
import { record } from '#src/permutation/primitive/record/record';
import { series } from '#src/permutation/primitive/series/series';

test('merge two primitive series', () => {
	const a = series(each(1, 2));
	const b = series(each(3, 4));
	const m = a.merge(b);
	for (const element of m) {
		console.log(element);
	}
});

test('merge two record series', () => {
	const a = series(record({ a: each(1, 2) }));
	const b = series(record({ b: each(3, 4) }));
	const m = a.merge(b);
	for (const element of m) {
		console.log(element);
	}
});
