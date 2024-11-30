import type { Expandable } from '#src/types/common.type';
import {
	type DeepEntries,
	deepEntries,
	type SquashedKeysOfDeepEntries,
} from '#src/utils/entries/break-deep';
import type { FromEntries } from '#src/utils/entries/combine';
import type { EntryKey } from '#src/utils/entries/common';
import type { UnionToIntersection } from '#src/types/union-to-tuple';

export type DeepFlatKeys<T extends Expandable> = keyof FromEntries<
	SquashedKeysOfDeepEntries<DeepEntries<T>>
> extends infer P extends string
	? P
	: never;

export type MutableFlatKeys<T> = T extends Expandable ? DeepFlatKeys<T> & string : '/';

export type ExtractEntriesKeys<T extends readonly [readonly EntryKey[], unknown]> =
	T extends unknown ? T[0] : never;
export type AllPossibleRoutes<T extends readonly EntryKey[]> = readonly [T] extends readonly [never]
	? never
	: T extends readonly [...infer U extends readonly EntryKey[], unknown]
		? T | AllPossibleRoutes<U>
		: never;
export type DeepReplicatedEntryKeys<T extends Expandable> = AllPossibleRoutes<
	ExtractEntriesKeys<DeepEntries<T>>
>;
export type SquashMapping<T extends readonly EntryKey[]> =
	UnionToIntersection<
		T extends unknown ? { [K in SquashKeys<T>]: T } : never
	> extends infer P extends Record<string, T>
		? P
		: never;
export type SquashMappingOfAnObject<T extends Expandable> = SquashMapping<
	DeepReplicatedEntryKeys<T>
>;
export function squashMappingOf<const T extends Expandable>(input: T): SquashMappingOfAnObject<T> {
	const e = deepEntries(input).map(([k]) => k);
	const e2 = e.flatMap((v) =>
		v.reduce(
			(acc, curr) => [...acc, [...(acc.at(-1) ?? []), curr]],
			[] as readonly (readonly EntryKey[])[],
		),
	);
	return Object.fromEntries(e2.map((k) => [squashKeys(k), k])) as SquashMappingOfAnObject<T>;
}

export type SquashKeys<T extends readonly EntryKey[]> = T extends readonly [
	...infer U extends readonly EntryKey[],
	infer P extends EntryKey,
]
	? U extends readonly []
		? P extends readonly [number]
			? `[${P[0]}]`
			: `${Exclude<P, readonly [number]>}`
		: P extends readonly [number]
			? `${SquashKeys<U>}[${P[0]}]`
			: `${SquashKeys<U>}.${Exclude<P, readonly [number]>}`
	: never;

export function squashKeys<const T extends readonly EntryKey[]>(keys: T): SquashKeys<T> {
	return keys.reduce(
		(acc, curr) => `${acc}${Array.isArray(curr) ? `[${curr}]` : `${acc ? '.' : ''}${curr}`}`,
		'',
	) as SquashKeys<T>;
}
