import type { Expandable, ExpandableArray } from '#src/utils/expandable-check';
import type { UnionToTuple } from '#src/utils/union-utils';

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
	UnionToTuple<K extends unknown ? [T[K]] : never> extends infer U extends readonly (readonly [
		unknown,
	])[]
		? U
		: never;
export type UnwrapSplitEntries<T extends readonly (readonly [unknown])[]> = {
	[K in keyof T]: T[K][0];
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
export type Length<T extends readonly unknown[]> = T extends { length: infer L extends number }
	? L
	: never;
