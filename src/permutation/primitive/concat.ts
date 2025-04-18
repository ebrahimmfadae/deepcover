import type {
	Permutation,
	PermutationGenerator,
	UnwrapPermutation,
} from '#src/permutation/definitions';
import type { Sum } from '#src/utils/arithmetic/sum';
import type { Length } from '#src/utils/common';

export function concat<const T extends Permutation, const U extends unknown[]>(
	input: PermutationGenerator<T>,
	...values: U
) {
	return function () {
		const r = input();
		return {
			size: (r.size + values.length) as Sum<T['size'], Length<U>>,
			type: r.type,
			modifiers: r.modifiers,
			*[Symbol.iterator]() {
				yield* r;
				yield* values;
			},
		};
	} as PermutationGenerator<
		{
			readonly size: Sum<T['size'], Length<U>>;
			readonly type: T['type'];
			readonly modifiers: T['modifiers'];
		} & Iterable<UnwrapPermutation<T> | U[number]>
	>;
}
