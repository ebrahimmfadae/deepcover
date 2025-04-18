import type { PermutationGenerator } from '#src/permutation/definitions';
import type { Length, TupleToUnion } from '#src/utils/common';

export function each<const T extends readonly unknown[]>(...values: T) {
	return function () {
		return {
			size: values.length as Length<T>,
			type: 'each',
			modifiers: [],
			*[Symbol.iterator]() {
				yield* values;
			},
		};
	} as PermutationGenerator<
		{ readonly size: Length<T>; readonly type: 'each'; readonly modifiers: [] } & Iterable<
			TupleToUnion<T>
		>
	>;
}
