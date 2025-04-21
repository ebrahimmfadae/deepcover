import type {
	Permutation,
	PermutationGenerator,
	UnwrapPermutation,
	UnwrapPermutationGenerator,
} from '#src/permutation/definitions';
import { concat } from '#src/permutation/primitive/concat';
import { explicitPermutations } from '#src/permutation/pure/explicit-permutations';
import { REMOVE } from '#src/permutation/symbols';
import type { Sum } from '#src/utils/arithmetic/sum';
import type { CastAsNumericArray, CastAsPermutationGenerator } from '#src/utils/casting';
import type { EntryValuesAsTuple } from '#src/utils/common';
import { isExpandableArray } from '#src/utils/expandable-check';
import type { MultiplyTuple } from '#src/utils/exports';
import type { ArraySplice, SetOptional, UnionToTuple } from 'type-fest';

type UnwrapValue<T> = UnwrapPermutation<UnwrapPermutationGenerator<CastAsPermutationGenerator<T>>>;
type At<A, K extends PropertyKey> = A extends readonly unknown[]
	? number extends A['length']
		? K extends number | `${number}`
			? A[never] | undefined
			: undefined
		: K extends keyof A
			? A[K]
			: undefined
	: unknown extends A
		? unknown
		: K extends keyof A
			? A[K]
			: undefined;
type Unionize<
	L extends readonly unknown[],
	L1 extends readonly unknown[],
	K extends PropertyKey = PropertyKey,
> = Readonly<{
	[P in keyof L]: P extends K ? L[P] | At<L1, P> : L[P];
}>;
type UnionizeTuple<T extends readonly (readonly unknown[])[]> = T extends readonly [
	infer First extends readonly unknown[],
	infer Second extends readonly unknown[],
	...infer Rest extends readonly (readonly unknown[])[],
]
	? UnionizeTuple<readonly [Unionize<First, Second>, ...Rest]>
	: T;
/**
 * TypeScript (<=5.8.3) does not support arbitrary positioned optional key in tuples.
 *
 * "I'm limited by the technology of my time." Howard Stark
 */
type SetTupleOptional<T extends readonly unknown[], K extends number> = readonly [] extends T
	? T
	: [K] extends [never]
		? T
		: UnionizeTuple<
				UnionToTuple<
					K extends unknown ? Readonly<ArraySplice<T, K, 1, [T[K]?]>> : never
				> extends infer U extends readonly (readonly unknown[])[]
					? U
					: never
			>[0];

export type ValidRecordInput =
	| Readonly<Record<string, PermutationGenerator>>
	| readonly PermutationGenerator[];

export type GetOptionalKeys<T extends ValidRecordInput> = {
	[K in keyof T]: 'optional' extends UnwrapPermutationGenerator<
		CastAsPermutationGenerator<T[K]>
	>['modifiers'][number]
		? K
		: never;
};

export type UnwrapValidRecordInput<T extends ValidRecordInput> = {
	[K in keyof T]: UnwrapValue<T[K]>;
};

export type Parse<T extends string> = T extends `${infer U extends number}` ? U : never;

export type RecordGenerator<T extends ValidRecordInput> = T extends readonly unknown[]
	? SetTupleOptional<
			UnwrapValidRecordInput<T> extends infer U extends readonly unknown[] ? U : never,
			GetOptionalKeys<T>[number] extends `${infer U extends number}` ? U : never
		>
	: SetOptional<UnwrapValidRecordInput<T>, GetOptionalKeys<T>[keyof T]> extends infer U
		? U
		: never;

export type SizeCalculator<T extends ValidRecordInput> = {
	[K in keyof T]: [UnwrapValue<T[K]>] extends [never]
		? 1
		: 'optional' extends UnwrapPermutationGenerator<
					CastAsPermutationGenerator<T[K]>
			  >['modifiers'][number]
			? Sum<UnwrapPermutationGenerator<CastAsPermutationGenerator<T[K]>>['size'], 1>
			: UnwrapPermutationGenerator<CastAsPermutationGenerator<T[K]>>['size'];
};

export type SizeAccumulator<T extends ValidRecordInput> = MultiplyTuple<
	CastAsNumericArray<EntryValuesAsTuple<SizeCalculator<T>>>
>;

export function record<const T extends ValidRecordInput>(input: T) {
	return function () {
		const r = Object.entries(input).map(([k, v]) => {
			const b = v();
			const ret = b.modifiers.includes('optional')
				? ([k, concat(v, REMOVE)()] as const)
				: ([k, b] as const);
			return ret as [string, Permutation];
		});
		const size = r.map((v) => v[1].size || 1).reduce((acc, curr) => acc * curr, 1);
		return {
			size: size as SizeAccumulator<T>,
			type: 'record',
			modifiers: [],
			*[Symbol.iterator]() {
				if (isExpandableArray(input)) {
					yield* explicitPermutations(r.map((v) => v[1])).map((v) => {
						const clone = [...v];
						clone.forEach((u, i) => {
							if (u === REMOVE) delete clone[i];
						});
						return clone;
					});
				} else {
					const iterableInput = r.map((v) => Iterator.from(v[1]).map((u) => [v[0], u]));
					yield* explicitPermutations(iterableInput)
						.map((v) => v.filter((u) => !!u).filter((u) => u[1] !== REMOVE))
						.map((v) => Object.fromEntries(v));
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
