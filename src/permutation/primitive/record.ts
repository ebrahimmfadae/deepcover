import type {
	Permutation,
	PermutationGenerator,
	UnwrapPermutation,
	UnwrapPermutationGenerator,
} from '#src/permutation/definitions';
import { concat } from '#src/permutation/primitive/concat';
import { explicitPermutations } from '#src/permutation/pure/explicit-permutations';
import { REMOVE } from '#src/permutation/symbols';
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
		const r = Object.entries(input).map(([k, v]) => {
			const b = v();
			const ret = b.modifiers.includes('optional')
				? ([k, concat(v, REMOVE)()] as const)
				: ([k, b] as const);
			return ret as [string, Permutation];
		});
		const size = r.reduce((acc, curr) => {
			const [, p] = curr;
			const isOptional = p.modifiers.includes('optional');
			const currentSize = p.size + (isOptional ? 1 : 0);
			return acc * currentSize;
		}, 1);
		return {
			size,
			type: 'record',
			modifiers: [],
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
		{ readonly size: number; readonly type: 'record'; readonly modifiers: [] } & Iterable<
			RecordGenerator<T>
		>
	>;
}
