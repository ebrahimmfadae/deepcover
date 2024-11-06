import { REMOVE } from '#src/permutation/symbols';
import type { Expandable, ExpandableArray } from '#src/types/common.type';
import {
	deepEntries,
	squashKeys,
	type CastArrayKeyAsNumber,
	type DeepEntries,
	type SquashKeys,
	type UnionToIntersection,
	type UnionToTuple,
} from '#src/utils/entries';
import { isPOJO, typeSafeIsArray } from '#src/utils/utils';

type SquashedKeysOfDeepEntries<T extends readonly (string | number | readonly [number])[]> =
	T extends unknown ? SquashKeys<T> : never;

type DeepFlatKeys<T extends Record<string, unknown> | readonly unknown[]> =
	SquashedKeysOfDeepEntries<DeepReplicatedEntryKeys<T>>;
type DeepReplicatedEntryKeys<T extends Record<string, unknown> | readonly unknown[]> =
	AllPossibleRoutes<ExtractEntriesKeys<DeepEntries<T>>>;
function squashMappingOf<const T extends Record<string, unknown> | readonly unknown[]>(
	input: T,
): SquashMappingOfAnObject<T> {
	const e = deepEntries(input).map(([k]) => k);
	const e2 = e.flatMap((v) =>
		v.reduce(
			(acc, curr) => [...acc, [...(acc.at(-1) ?? []), curr]],
			[] as readonly (string | number | readonly [number])[][],
		),
	);
	return Object.fromEntries(e2.map((k) => [squashKeys(k), k]));
}

export function deepSetValueInObject<
	T extends Record<string, unknown> | unknown[],
	U extends readonly (string | number | readonly [number])[],
	const P,
>(input: T, key: U, value: P) {
	if (key.length === 1) {
		const k = key[0]!;
		const k2 = typeSafeIsArray(k) ? k[0]! : k;
		if (typeSafeIsArray(input) && typeof k2 === 'number') {
			if (k2 in input) input[k2] = value;
		} else if (isPOJO(input) && typeof k2 === 'string') {
			if (k2 in input) input[k2] = value;
		}
	} else {
		const [k, ...rest] = key;
		const k2 = typeSafeIsArray(k) ? k[0]! : k;
		if (typeSafeIsArray(input) && typeof k2 === 'number') {
			if (!isPOJO(input[k2]) && !typeSafeIsArray(input[k2])) return;
			else deepSetValueInObject(input[k2], rest, value);
		} else if (isPOJO(input) && typeof k2 === 'string') {
			if (!isPOJO(input[k2]) && !typeSafeIsArray(input[k2])) return;
			else deepSetValueInObject(input[k2], rest, value);
		}
	}
}

export function deepReplaceKeys<
	T extends Record<string, unknown> | unknown[],
	const K extends DeepFlatKeys<T>,
	const P,
>(input: T, key: K, value: P): EliminateKeysFromExpandable<T, K> {
	const squashMappings = squashMappingOf(input);
	const k = squashMappings[key] ?? [];
	deepSetValueInObject(input, k, value);
	return input as EliminateKeysFromExpandable<T, K>;
}

export function deepEliminateKeys<
	const T extends Record<string, unknown> | unknown[],
	const K extends DeepFlatKeys<T> | ({} & string),
>(input: T, keys: readonly K[]): EliminateKeysFromExpandable<T, K> {
	keys.forEach((v) => deepReplaceKeys(input, v, REMOVE));
	return input as EliminateKeysFromExpandable<T, K>;
}

type ExtractEntriesKeys<
	T extends readonly [readonly (string | number | readonly [number])[], unknown],
> = T extends unknown ? T[0] : never;
type AllPossibleRoutes<T extends readonly (string | number | readonly [number])[]> = [T] extends [
	never,
]
	? never
	: T extends [...infer U extends readonly (string | number | readonly [number])[], unknown]
		? T | AllPossibleRoutes<U>
		: never;
type SquashMapping<T extends readonly (string | number | readonly [number])[]> =
	UnionToIntersection<
		T extends unknown ? { [K in SquashKeys<T>]: T } : never
	> extends infer P extends Record<string, T>
		? P
		: never;
type SquashMappingOfAnObject<T extends Record<string, unknown> | readonly unknown[]> =
	SquashMapping<DeepReplicatedEntryKeys<T>>;
type EliminateKeysFromExpandable<
	T extends Record<string, unknown> | readonly unknown[],
	U extends keyof SquashMappingOfAnObject<T>,
> = ReplaceMultipleKeysWithValueInObject<
	T,
	UnionToTuple<SquashMappingOfAnObject<T>[U]>,
	typeof REMOVE
>;

type AreKeysEqual<
	T extends string | number | readonly [number],
	U extends PropertyKey,
> = T extends readonly [infer P extends number]
	? P extends U
		? true
		: false
	: T extends U
		? true
		: false;

type ExtractKey<T extends string | number | readonly [number]> = T extends readonly [
	infer P extends number,
]
	? P
	: T;

type ReplaceValueInObject<
	T extends Record<string, unknown> | readonly unknown[],
	D extends readonly (string | number | readonly [number])[],
	P,
> =
	Expandable<T> extends true
		? D extends [
				infer V extends string | number | readonly [number],
				...infer U extends readonly (string | number | readonly [number])[],
			]
			? {
					[K in keyof T]: AreKeysEqual<
						V,
						ExpandableArray<T> extends true ? CastArrayKeyAsNumber<K> : K
					> extends true
						? U extends []
							? P
							: T[Extract<ExtractKey<V>, keyof T>] extends
										| Record<string, unknown>
										| readonly unknown[]
								? ReplaceValueInObject<T[Extract<ExtractKey<V>, keyof T>], U, P>
								: T[K]
						: T[K];
				}
			: T
		: T;
type ReplaceMultipleKeysWithValueInObject<
	T extends Record<string, unknown> | readonly unknown[],
	D extends readonly (readonly (string | number | readonly [number])[])[],
	P,
> = D extends [
	infer V extends readonly (string | number | readonly [number])[],
	...infer U extends readonly (readonly (string | number | readonly [number])[])[],
]
	? U extends []
		? ReplaceValueInObject<T, V, P>
		: ReplaceMultipleKeysWithValueInObject<ReplaceValueInObject<T, V, P>, U, P>
	: T;
