import type {
	PermutationGenerator,
	UnwrapPermutation,
	UnwrapPermutationGenerator,
} from '#src/permutation/definitions';
import { explicitPermutations } from '#src/permutation/pure/explicit-permutations';
import type { PlainType } from '#src/utils/common';
import { isExpandableArray } from '#src/utils/expandable-check';

type CastAsPermutationGenerator<T> = T extends PermutationGenerator ? T : never;
type UnwrapValue<T> = UnwrapPermutation<UnwrapPermutationGenerator<CastAsPermutationGenerator<T>>>;

export type ValidRecordInput =
	| Readonly<Record<string, PermutationGenerator>>
	| readonly PermutationGenerator[];
export type RecordGenerator<T extends ValidRecordInput> = PlainType<{
	[K in keyof T]: UnwrapValue<T[K]>;
}>;

export function record<const T extends ValidRecordInput>(input: T) {
	return function () {
		const r = Object.entries(input).map(([k, v]) => [k, v()] as const);
		const size = r.reduce((acc, curr) => acc * curr[1].size, 1);
		return {
			size,
			type: 'record',
			*[Symbol.iterator]() {
				if (isExpandableArray(input)) {
					yield* explicitPermutations(r.map((v) => v[1]));
				} else {
					const iterableInput = r.map((v) => Iterator.from(v[1]).map((u) => [v[0], u]));
					yield* explicitPermutations(iterableInput).map((v) => Object.fromEntries(v));
				}
			},
		};
	} as PermutationGenerator<
		{
			readonly size: number;
			readonly type: 'record';
		} & Iterable<RecordGenerator<T>>
	>;
}
