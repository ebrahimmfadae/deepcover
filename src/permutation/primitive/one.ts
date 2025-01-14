import type { PermutationGenerator } from '#src/permutation/definitions';
import type { Length, TupleToUnion } from '#src/utils/common';

export function one<const T extends unknown[]>(...values: T) {
	return function () {
		return {
			size: values.length as Length<T>,
			type: 'one',
			*[Symbol.iterator]() {
				for (const value of values) yield value;
			},
		};
	} as PermutationGenerator<
		{
			readonly size: Length<T>;
			readonly type: 'one';
		} & Iterable<TupleToUnion<T>>
	>;
}
