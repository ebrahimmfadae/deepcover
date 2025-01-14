import type {
	Permutation,
	PermutationGenerator,
	UnwrapPermutation,
} from '#src/permutation/definitions';
import { REMOVE } from '#src/permutation/symbols';
import type { Sum } from '#src/utils/arithmetic/sum.type';

export function optional<const T extends Permutation>(input: PermutationGenerator<T>) {
	return function () {
		const r = input();
		return {
			size: (r.size + 1) as Sum<T['size'], 1>,
			type: 'optional',
			*[Symbol.iterator]() {
				yield REMOVE;
				yield* r;
			},
		};
	} as PermutationGenerator<
		{
			readonly size: Sum<T['size'], 1>;
			readonly type: 'optional';
		} & Iterable<UnwrapPermutation<T> | REMOVE>
	>;
}
