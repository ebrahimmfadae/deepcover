import type {
	Expandable,
	IsExpandable,
	IsExpandableArray,
	IsExpandableObject,
	TupleToUnion,
} from '#src/types/common.type';
import type {
	CastArrayKeyAsNumber,
	CastAsArray,
	ConcatKey,
	EntryKey,
} from '#src/utils/entries/common';
import { squashKeys, type SquashKeys } from '#src/utils/entries/keys';
import { isPOJO } from '#src/utils/type-check';
import { idempotentFreeze } from '#src/utils/utils';

export type DeepEntries<T, P extends readonly EntryKey[] = readonly []> = T extends unknown
	? IsExpandable<T> extends true
		? IsExpandableObject<T> extends true
			? {
					[K in Exclude<keyof T, symbol>]: DeepEntries<T[K], ConcatKey<P, K>>;
				}[Exclude<keyof T, symbol>]
			: IsExpandableArray<T> extends true
				? TupleToUnion<
						CastAsArray<{
							[K in keyof T]: DeepEntries<
								T[K],
								ConcatKey<P, [CastArrayKeyAsNumber<K>]>
							>;
						}>
					>
				: never
		: P extends readonly []
			? readonly []
			: readonly [P, T]
	: never;

export type SquashedKeysOfDeepEntries<
	T extends readonly [readonly EntryKey[], unknown] | readonly [],
> = T extends unknown
	? T extends readonly [readonly EntryKey[], unknown]
		? readonly [SquashKeys<T[0]>, T[1]]
		: readonly []
	: never;

export function deepEntries<const T extends Expandable>(
	o: T,
	route?: readonly EntryKey[],
): readonly DeepEntries<T>[] {
	if (!isPOJO(o) && !Array.isArray(o)) return [];
	return isPOJO(o)
		? Object.entries(o).flatMap(([k, v]) => {
				const fullKey = route ? [...route, k] : [k];
				const ret =
					isPOJO(v) || Array.isArray(v) ? deepEntries(v, fullKey) : [[fullKey, v]];
				return ret as readonly DeepEntries<T>[];
			})
		: o.flatMap((v, k) => {
				const fullKey = route ? ([...route, [k]] as const) : ([[k]] as const);
				const ret =
					isPOJO(v) || Array.isArray(v) ? deepEntries(v, fullKey) : [[fullKey, v]];
				return ret as readonly DeepEntries<T>[];
			});
}

export function squashedDeepEntries<const T extends Expandable>(
	o: T,
): readonly SquashedKeysOfDeepEntries<DeepEntries<T>>[] {
	return idempotentFreeze(
		deepEntries(o).map(([k, v]) => [squashKeys(k), v] as const),
	) as readonly SquashedKeysOfDeepEntries<DeepEntries<T>>[];
}
