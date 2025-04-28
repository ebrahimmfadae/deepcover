import type {
	PermutationGenerator,
	UnwrapPermutation,
	UnwrapPermutationGenerator,
} from '#src/permutation/definitions';
import { each, isOptional, optional } from '#src/permutation/exports';
import { clean } from '#src/permutation/modifiers/clean';
import { space } from '#src/permutation/primitive/space';
import { explicitPermutations } from '#src/permutation/pure/explicit-permutations';
import { REMOVE } from '#src/permutation/symbols';
import { allPathLevels, merge } from '#src/permutation/utils';
import type { Sum } from '#src/utils/arithmetic/sum';
import type { CastAsNumericArray, CastAsPermutationGenerator } from '#src/utils/casting';
import type { EntryValuesAsTuple } from '#src/utils/common';
import { hasKey } from '#src/utils/entries';
import { isExpandableArray } from '#src/utils/expandable-check';
import type { MultiplyTuple } from '#src/utils/exports';
import type { ArraySplice, LiteralUnion, Paths, SetOptional, UnionToTuple } from 'type-fest';
import { series } from './series';

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
	[K in keyof T]: 'optional' extends CastAsPermutationGenerator<T[K]>['modifiers'][number]
		? K
		: never;
};

export type UnwrapValidRecordInput<T extends ValidRecordInput> = {
	[K in keyof T]: UnwrapValue<T[K]>;
};

export type Parse<T extends string> = T extends `${infer U extends number}` ? U : never;

export type RecordOutputMapper<T extends ValidRecordInput> = T extends readonly unknown[]
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
		: 'optional' extends CastAsPermutationGenerator<T[K]>['modifiers'][number]
			? Sum<CastAsPermutationGenerator<T[K]>['size'], 1>
			: CastAsPermutationGenerator<T[K]>['size'];
};

export type SizeAccumulator<T extends ValidRecordInput> = MultiplyTuple<
	CastAsNumericArray<EntryValuesAsTuple<SizeCalculator<T>>>
>;

export type StringifiedPaths<T extends ValidRecordInput> =
	Paths<RecordOutputMapper<T>> extends infer U extends string ? U : never;

export type RecordContext<T extends ValidRecordInput> = {
	readonly removeKeys?: readonly LiteralUnion<StringifiedPaths<T>, string>[];
};

export type RecordGenerator<T extends ValidRecordInput = ValidRecordInput> = () => Iterable<
	RecordOutputMapper<T>
>;

export type RecordPatch<T extends ValidRecordInput = ValidRecordInput> = {
	readonly size: SizeAccumulator<T>;
	readonly originalInputArg: T;
	readonly type: 'record';
	readonly modifiers: [];
	readonly structure: T extends readonly unknown[] ? 'array' : 'pojo';
	readonly permutationPaths: string[];
	readonly primitivePermutationPaths: string[];
	extract: (paths: readonly string[]) => PermutationGenerator;
	exclude: (paths: readonly string[]) => PermutationGenerator;
	generatorAt: (path: string) => PermutationGenerator;
	override: (v: PermutationGenerator) => PermutationGenerator;
};

// TODO: Support situation when `a` is optional. We should add all `b` permutations without merging.
//		The problem is that we have cleared modifier data in `series` merging.
export function mergeRecord(
	a: RecordGenerator & RecordPatch,
	b: RecordGenerator & RecordPatch,
): RecordGenerator & RecordPatch {
	if (isPojoRecord(a) && isPojoRecord(b)) {
		const entries = Object.entries(a.originalInputArg).map(([k, u]) => {
			if (hasKey(b.originalInputArg, k))
				return [k, u.override(b.originalInputArg[k]!)] as const;
			return [k, u] as const;
		});
		const overrode = {
			...b.originalInputArg,
			...Object.fromEntries(entries),
		};
		const res0 = isOptional(a) ? series(record(overrode), clean(b)) : record(overrode);
		const res = isOptional(b) ? optional(res0) : res0;
		return res as RecordGenerator & RecordPatch;
	}
	if (isArrayRecord(a) && isArrayRecord(b)) {
		const maxLength = Math.max(a.originalInputArg.length, b.originalInputArg.length);
		const overrode = Array.from(new Array(maxLength), (_, i) => {
			if (hasKey(a.originalInputArg, i) && hasKey(b.originalInputArg, i))
				return a.originalInputArg[i]!.override(b.originalInputArg[i]!);
			return (a.originalInputArg[i] ?? b.originalInputArg[i])!;
		});
		const res0 = isOptional(a) ? series(record(overrode), clean(b)) : record(overrode);
		const res = isOptional(b) ? optional(res0) : res0;
		return res as RecordGenerator & RecordPatch;
	}
	return b;
}

export function record<const T extends ValidRecordInput>(
	input: T,
): RecordGenerator<T> & RecordPatch<T> {
	const r = Object.entries(input).map(([k, v]): [string, PermutationGenerator] =>
		v.modifiers.includes('optional') ? [k, series(clean(v), each(REMOVE))] : [k, v],
	);
	const size = r.map((v) => v[1].size || 1).reduce((acc, curr) => acc * curr, 1);
	return Object.assign(
		function* () {
			if (isExpandableArray(input)) {
				yield* explicitPermutations(r.map((v) => v[1]())).map((v) => {
					const clone = new Array(v.length);
					v.forEach((u, i) => {
						if (u !== REMOVE) clone[i] = u;
					});
					return clone;
				});
			} else {
				const iterableInput = r.map((v) => Iterator.from(v[1]()).map((u) => [v[0], u]));
				yield* explicitPermutations(iterableInput)
					.map((v) => v.filter((u) => !!u).filter((u) => u[1] !== REMOVE))
					.map((v) => Object.fromEntries(v));
			}
		} as RecordGenerator<T>,
		{
			get size() {
				return size as SizeAccumulator<T>;
			},
			get modifiers() {
				return [] as [];
			},
			get originalInputArg() {
				return input;
			},
			get type() {
				return 'record' as const;
			},
			get structure() {
				return (isExpandableArray(input) ? 'array' : 'pojo') as T extends readonly unknown[]
					? 'array'
					: 'pojo';
			},
			get permutationPaths() {
				const entries = Object.entries(input);
				const pathLevels = entries
					.flatMap((v) => {
						const u = v[1].permutationPaths;
						if (u.length === 0) return [v[0]];
						return u.map((w) => `${v[0]}.${w}`);
					})
					.flatMap((v) => allPathLevels(v));
				return [...new Set(pathLevels)];
			},
			get primitivePermutationPaths() {
				return this.permutationPaths.filter(
					(v) => this.generatorAt(v).structure === 'primitive',
				);
			},
			extract(paths) {
				const extractedInputEntries = Object.entries(input).map(([k, v]) => {
					const filteredPaths = paths.filter((u) => u.startsWith(k));
					if (filteredPaths.length === 0) return [k, space()];
					if (filteredPaths.length === 1 && filteredPaths.includes(k)) return [k, v];
					const shiftPaths = filteredPaths.map((u) => u.replace(`${k}.`, ''));
					return [k, v.extract(shiftPaths)];
				});
				const extractedInput = isExpandableArray(input)
					? extractedInputEntries.map((v) => v[1])
					: Object.fromEntries(extractedInputEntries);
				return record(extractedInput);
			},
			exclude(paths) {
				const extractedInputEntries = Object.entries(input).map(([k, v]) => {
					const filteredPaths = paths.filter((u) => u.startsWith(k));
					if (filteredPaths.length === 0) return [k, v];
					if (filteredPaths.includes(k)) return [k, space()];
					const shiftPaths = filteredPaths.map((u) => u.replace(`${k}.`, ''));
					return [k, v.exclude(shiftPaths)];
				});
				const extractedInput = isExpandableArray(input)
					? extractedInputEntries.map((v) => v[1])
					: Object.fromEntries(extractedInputEntries);
				return record(extractedInput);
			},
			generatorAt(path) {
				const [splitted, ...rest] = path?.split('.') ?? [];
				if (!path || !hasKey(input, splitted)) return each();
				const v = input[splitted] as PermutationGenerator;
				if (rest.length === 0) return v;
				return v.generatorAt(rest.join('.'));
			},
			override(v) {
				return merge(this, v);
			},
		} satisfies RecordPatch<T> & ThisType<RecordGenerator<T> & RecordPatch<T>>,
	) as RecordGenerator<T> & RecordPatch<T>;
}

export function isRecord(v: PermutationGenerator): v is RecordGenerator & RecordPatch {
	return v.type === 'record';
}

export function isPojoRecord(
	v: PermutationGenerator,
): v is RecordGenerator<Readonly<Record<string, PermutationGenerator>>> &
	RecordPatch<Readonly<Record<string, PermutationGenerator>>> {
	if (!isRecord(v)) return false;
	return v.structure === 'pojo';
}

export function isArrayRecord(
	v: PermutationGenerator,
): v is RecordGenerator<readonly PermutationGenerator[]> &
	RecordPatch<readonly PermutationGenerator[]> {
	if (!isRecord(v)) return false;
	return v.structure === 'array';
}
