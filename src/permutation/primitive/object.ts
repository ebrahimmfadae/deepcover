import type {
	PermutationGenerator,
	UnwrapPermutation,
	UnwrapPermutationGenerator,
} from '#src/permutation/definitions';
import { explicitPermutations } from '#src/permutation/pure/explicit-permutations';

export type ObjectGenerator<T extends Readonly<Record<string, PermutationGenerator>>> = {
	[K in keyof T]: UnwrapPermutation<UnwrapPermutationGenerator<T[K]>>;
} extends infer P
	? P
	: never;

export function object<const T extends Readonly<Record<string, PermutationGenerator>>>(input: T) {
	return function () {
		const r = Object.entries(input).map(([k, v]) => [k, v()] as const);
		const size = r.reduce((acc, curr) => acc * curr[1].size, 1);
		return {
			size: size,
			type: 'object',
			*[Symbol.iterator]() {
				yield* explicitPermutations(
					r.map((v) => Iterator.from(v[1]).map((u) => [v[0], u])),
				).map((v) => Object.fromEntries(v));
			},
		} as const;
	} as PermutationGenerator<
		{
			readonly size: number;
			readonly type: 'object';
		} & Iterable<ObjectGenerator<T>>
	>;
}
