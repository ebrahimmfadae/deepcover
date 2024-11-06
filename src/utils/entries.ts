import type {
	Expandable,
	ExpandableArray,
	ExpandableObject,
	TupleToUnion,
} from '#src/types/common.type';
import type { MergeUnion } from '#src/types/merge.type';
import { isPOJO } from '#src/utils/utils';

export type ConcatKey<
	Prefix extends readonly (string | number | readonly [number])[],
	K extends string | number | readonly [number],
> = [...Prefix, K];

export type CastAsArray<T> = T extends readonly unknown[] ? T : never;

export type CastArrayKeyAsNumber<T extends PropertyKey> = T extends number
	? T
	: T extends `${infer P extends number}`
		? P
		: never;

export type DeepEntries<
	T,
	P extends readonly (string | number | readonly [number])[] = [],
> = T extends unknown
	? Expandable<T> extends true
		? ExpandableObject<T> extends true
			? {
					[K in Exclude<keyof T, symbol>]: DeepEntries<T[K], ConcatKey<P, K>>;
				}[Exclude<keyof T, symbol>]
			: ExpandableArray<T> extends true
				? TupleToUnion<
						CastAsArray<{
							[K in keyof T]: DeepEntries<
								T[K],
								ConcatKey<P, [CastArrayKeyAsNumber<K>]>
							>;
						}>
					>
				: never
		: [P, T]
	: never;

export type SquashKeys<T extends readonly (string | number | readonly [number])[]> = T extends [
	...infer U extends (string | number | readonly [number])[],
	infer P extends string | number | readonly [number],
]
	? U extends []
		? P extends readonly [number]
			? `[${P[0]}]`
			: `${Exclude<P, readonly [number]>}`
		: P extends readonly [number]
			? `${SquashKeys<U>}[${P[0]}]`
			: `${SquashKeys<U>}.${Exclude<P, readonly [number]>}`
	: never;

export type SquashedKeysOfDeepEntries<
	T extends [(string | number | readonly [number])[], unknown],
> = T extends unknown ? [SquashKeys<T[0]>, T[1]] : never;

export function deepEntries<const T extends Record<string, unknown> | readonly unknown[]>(
	o: T,
	route?: readonly (string | number | readonly [number])[],
): DeepEntries<T>[] {
	if (!isPOJO(o) && !Array.isArray(o)) return [];
	return isPOJO(o)
		? Object.entries(o).flatMap(([k, v]) => {
				const fullKey = route ? [...route, k] : [k];
				const ret =
					isPOJO(v) || Array.isArray(v) ? deepEntries(v, fullKey) : [[fullKey, v]];
				return ret as DeepEntries<T>[];
			})
		: o.flatMap((v, k) => {
				const fullKey = route ? ([...route, [k]] as const) : ([[k]] as const);
				const ret =
					isPOJO(v) || Array.isArray(v) ? deepEntries(v, fullKey) : [[fullKey, v]];
				return ret as DeepEntries<T>[];
			});
}

export function squashKeys<const T extends readonly (string | number | readonly [number])[]>(keys: T) {
	return keys.reduce(
		(acc, curr) => `${acc}${Array.isArray(curr) ? `[${curr}]` : `${acc ? '.' : ''}${curr}`}`,
		'',
	);
}

export function squashedDeepEntries<const T extends Record<string, unknown> | readonly unknown[]>(
	o: T,
) {
	return deepEntries(o).map(([k, v]) => [squashKeys(k), v]) as SquashedKeysOfDeepEntries<
		DeepEntries<T>
	>[];
}

export type Entries<T> = T extends unknown
	? Expandable<T> extends true
		? ExpandableObject<T> extends true
			? { [K in keyof T]: [K, T[K]] }[keyof T]
			: ExpandableArray<T> extends true
				? { [K in keyof T]: [[CastArrayKeyAsNumber<K>], T[K]] }
				: never
		: never
	: never;

export function typeSafeEntries<const T extends Record<string, unknown> | readonly unknown[]>(
	o: T,
): Entries<T>[] {
	return Object.entries(o) as Entries<T>[];
}

export type EntryToObject<T extends readonly [string | number, unknown]> = T extends readonly [
	infer K extends string,
	infer V,
]
	? { [key in K]: V }
	: never;

export type FromEntries<T extends readonly [string, unknown]> = MergeUnion<
	T extends infer U extends readonly [string, unknown] ? EntryToObject<U> : never
>;

export type DeepFlatKeys<T extends Record<string, unknown> | readonly unknown[]> =
	keyof FromEntries<SquashedKeysOfDeepEntries<DeepEntries<T>>>;

export type MutableFlatKeys<T> = T extends Record<string, unknown> | readonly unknown[]
	? DeepFlatKeys<T> & string
	: '/';

export function typeSafeFromEntries<const T extends readonly [string, unknown]>(entries: T[]) {
	return Object.fromEntries(entries) as FromEntries<T>;
}

export type AllUnionPermutations<T, T2 extends T = T> = T extends unknown
	? Exclude<T2, T> extends never
		? [T]
		: [T, ...AllUnionPermutations<Exclude<T2, T>>]
	: never;

export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
	k: infer I,
) => void
	? I
	: never;

export type UnionToOverloads<T> = UnionToIntersection<T extends unknown ? (f: T) => void : never>;

export type PopUnion<T> = UnionToOverloads<T> extends (a: infer A extends T) => void ? A : never;

export type UnionToTuple<T, A extends readonly unknown[] = []> = [T] extends readonly [
	UnionToIntersection<T>,
]
	? [T, ...A]
	: UnionToTuple<Exclude<T, PopUnion<T>>, [PopUnion<T>, ...A]>;

export type ValuesAsTuple<T extends Record<string, unknown>, U = UnionToTuple<keyof T>> = {
	[K in keyof U]: U[K] extends keyof T ? T[U[K]] : never;
};
