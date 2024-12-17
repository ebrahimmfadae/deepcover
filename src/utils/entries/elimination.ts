import { REMOVE } from '#src/permutation/symbols';
import type { Expandable, IsExpandable, IsExpandableArray } from '#src/types/common.type';
import type { UnionToTuple } from '#src/types/union-to-tuple';
import type { CastArrayKeyAsNumber, EntryKey } from '#src/utils/entries/common';
import {
	squashMappingOf,
	type DeepReplicatedEntryKeys,
	type SquashKeys,
	type SquashMappingOfAnObject,
} from '#src/utils/entries/keys';
import { isPOJO } from '#src/utils/type-check';

function deepSetValueInObject<
	T extends Record<string, unknown> | unknown[],
	U extends readonly EntryKey[],
	const P,
>(input: T, key: U, value: P) {
	if (key.length === 1) {
		const k = key[0]!;
		const k2 = Array.isArray(k) ? k[0] : k;
		if (Array.isArray(input) && typeof k2 === 'number') {
			if (k2 in input) input[k2] = value;
		} else if (isPOJO(input) && typeof k2 === 'string') {
			if (k2 in input) (input as Record<string, unknown>)[k2] = value;
		}
	} else {
		const [k, ...rest] = key;
		const k2 = Array.isArray(k) ? k[0] : k;
		if (Array.isArray(input) && typeof k2 === 'number') {
			if (!isPOJO(input[k2]) && !Array.isArray(input[k2])) return;
			else deepSetValueInObject(input[k2], rest, value);
		} else if (isPOJO(input) && typeof k2 === 'string') {
			if (!isPOJO(input[k2]) && !Array.isArray(input[k2])) return;
			else deepSetValueInObject(input[k2], rest, value);
		}
	}
}

type SquashedKeysOfDeepEntries<T extends readonly EntryKey[]> = T extends unknown
	? SquashKeys<T>
	: never;

export type DeepFlatKeys2<T extends Expandable> = SquashedKeysOfDeepEntries<
	DeepReplicatedEntryKeys<T>
>;

export function deepReplaceKeys<
	T extends Record<string, unknown> | unknown[],
	const K extends DeepFlatKeys2<T> | ({} & string),
	const P,
>(input: T, key: K, value: P): EliminateKeysFromExpandable<T, K> {
	const squashMappings = squashMappingOf(input);
	const k = squashMappings[key] ?? [];
	deepSetValueInObject(input, k, value);
	return input as EliminateKeysFromExpandable<T, K>;
}

export function deepEliminateKeys<
	const T extends Record<string, unknown> | unknown[],
	const K extends DeepFlatKeys2<T> | ({} & string),
>(input: T, keys: readonly K[]): EliminateKeysFromExpandable<T, K> {
	keys.forEach((v) => deepReplaceKeys(input, v, REMOVE));
	return input as EliminateKeysFromExpandable<T, K>;
}

export type AreKeysEqual<T extends EntryKey, U extends PropertyKey> = T extends readonly [
	infer P extends number,
]
	? P extends U
		? true
		: false
	: T extends U
		? true
		: false;

export type ExtractKey<T extends EntryKey> = T extends readonly [infer P extends number] ? P : T;

export type ReplaceValueInObject<T extends Expandable, D extends readonly EntryKey[], P> =
	IsExpandable<T> extends true
		? D extends readonly [infer V extends EntryKey, ...infer U extends readonly EntryKey[]]
			? {
					[K in keyof T]: AreKeysEqual<
						V,
						IsExpandableArray<T> extends true ? CastArrayKeyAsNumber<K> : K
					> extends true
						? U extends readonly []
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
export type ReplaceMultipleKeysWithValueInObject<
	T extends Expandable,
	D extends readonly (readonly EntryKey[])[],
	P,
> = D extends readonly [
	infer V extends readonly EntryKey[],
	...infer U extends readonly (readonly EntryKey[])[],
]
	? U extends readonly []
		? ReplaceValueInObject<T, V, P>
		: ReplaceMultipleKeysWithValueInObject<ReplaceValueInObject<T, V, P>, U, P>
	: T;

export type EliminateKeysFromExpandable<
	T extends Expandable,
	U extends keyof SquashMappingOfAnObject<T>,
> = ReplaceMultipleKeysWithValueInObject<T, UnionToTuple<SquashMappingOfAnObject<T>[U]>, REMOVE>;
