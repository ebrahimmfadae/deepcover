import type {
	Permutation,
	PermutationGenerator,
	UnwrapPermutation,
	UnwrapPermutationGenerator,
} from '#src/permutation/definitions';
import { concat } from '#src/permutation/primitive/concat';
import { explicitPermutations } from '#src/permutation/pure/explicit-permutations';
import { REMOVE } from '#src/permutation/symbols';
import type { MultiplyTuple } from '#src/utils/arithmetic/multiply';
import type { Sum } from '#src/utils/arithmetic/sum';
import type { CastAsNumericArray, CastAsPermutationGenerator } from '#src/utils/casting';
import type { EntryValuesAsTuple, PlainType } from '#src/utils/common';
import { isExpandableArray } from '#src/utils/expandable-check';

type UnwrapValue<T> = UnwrapPermutation<UnwrapPermutationGenerator<CastAsPermutationGenerator<T>>>;

export type ValidRecordInput =
	| Readonly<Record<string, PermutationGenerator>>
	| readonly PermutationGenerator[];

export type SizeCalculator<T extends ValidRecordInput> = {
	[K in keyof T]: 'optional' extends UnwrapPermutationGenerator<
		CastAsPermutationGenerator<T[K]>
	>['modifiers'][number]
		? Sum<UnwrapPermutationGenerator<CastAsPermutationGenerator<T[K]>>['size'], 1>
		: UnwrapPermutationGenerator<CastAsPermutationGenerator<T[K]>>['size'];
};

export type SizeAccumulator<T extends ValidRecordInput> = MultiplyTuple<
	CastAsNumericArray<EntryValuesAsTuple<SizeCalculator<T>>>
>;

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
		const size = r.reduce((acc, curr) => acc * curr[1].size, 1);
		return {
			size: size as SizeAccumulator<T>,
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
		{
			readonly size: SizeAccumulator<T>;
			readonly type: 'record';
			readonly modifiers: [];
		} & Iterable<RecordGenerator<T>>
	>;
}
