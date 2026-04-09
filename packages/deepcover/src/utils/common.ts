import type { PermutationGenerator } from '#src/permutation/definitions';
import type { Expandable, ExpandableArray } from '#src/utils/expandable-check';
import type { UnionToTuple } from '#src/utils/union-utils';
import type { AllUnionFields } from 'type-fest';

export type TupleToUnion<T extends readonly unknown[]> = T[number];
export type BuildTuple<T, S, U extends readonly unknown[] = readonly []> = (
	number extends S
		? readonly T[]
		: U extends { length: S }
			? U
			: BuildTuple<T, S, readonly [...U, T]>
) extends infer P extends readonly unknown[]
	? P
	: never;
export type SplitEntries<T extends Expandable, K extends keyof T = keyof T> =
	UnionToTuple<K extends unknown ? [K, T[K]] : never> extends infer U extends readonly (readonly [
		unknown,
		unknown,
	])[]
		? U
		: never;
export type UnwrapSplitEntries<T extends ExpandableArray<readonly [unknown, unknown]>> = {
	[K in keyof T]: T[K][1];
};
export type EntryValuesAsTuple<T extends Expandable> = T extends ExpandableArray
	? T
	: UnwrapSplitEntries<SplitEntries<T>>;
export type PlainType<T> = T extends infer P ? P : never;
export type PartialRecord<K extends PropertyKey, T> = Partial<Record<K, T>>;
export type Primitive = string | number | bigint | boolean | null | undefined;
export type ToPrimitive<T> = T extends number
	? number
	: T extends string
		? string
		: T extends boolean
			? boolean
			: T extends bigint
				? bigint
				: T extends null
					? null
					: T extends undefined
						? undefined
						: never;
export type Length<T extends readonly unknown[]> = readonly unknown[] extends T
	? bigint
	: T extends { length: infer L extends number }
		? `${L}` extends `${infer S extends bigint}`
			? S
			: never
		: never;
export type ShallowFlatTuple<
	T extends readonly unknown[],
	A extends readonly unknown[] = readonly [],
> = T extends readonly [unknown, ...(readonly unknown[])] | readonly []
	? T extends readonly [infer F, ...infer R]
		? ShallowFlatTuple<
				R,
				F extends readonly unknown[] ? readonly [...A, ...F] : readonly [...A, F]
			>
		: A
	: T extends readonly (infer U)[]
		? U extends readonly unknown[]
			? readonly U[number][]
			: readonly U[]
		: never;
type MapIndices<T extends ExpandableArray> = {
	[K in keyof T]: K extends `${infer U extends number}` ? U : never;
}[keyof T & number];
export type ExtractIndices<T extends ExpandableArray> =
	MapIndices<T> extends never ? number : MapIndices<T>;
export type ExtractKeys<T extends Expandable> =
	T extends Readonly<Record<string, unknown>>
		? keyof T
		: T extends readonly unknown[]
			? ExtractIndices<T> & keyof T
			: never;
export type Stringify<T extends Primitive> = T extends string ? T : `${T}`;
export type Loose<T extends PermutationGenerator> = Omit<T, 'modifiers'> & {
	readonly modifiers: readonly string[];
};

export function unionFields<T>(v: T): AllUnionFields<T> {
	return v as AllUnionFields<T>;
}
