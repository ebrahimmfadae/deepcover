import type {
	Expandable,
	IsExpandable,
	IsExpandableArray,
	IsExpandableObject,
} from '#src/types/common.type';
import type { CastArrayKeyAsNumber } from '#src/utils/entries/common';

export type Entries<T> = T extends unknown
	? IsExpandable<T> extends true
		? IsExpandableObject<T> extends true
			? { [K in keyof T]: [K, T[K]] }[keyof T]
			: IsExpandableArray<T> extends true
				? { [K in keyof T]: [[CastArrayKeyAsNumber<K>], T[K]] }
				: never
		: never
	: never;
export function typeSafeEntries<const T extends Expandable>(o: T): Entries<T>[] {
	return Object.entries(o) as Entries<T>[];
}
