import type { MergeUnion } from '#src/types/merge.type';

export type EntryToObject<T extends readonly [string | number, unknown]> = T extends readonly [
	infer K extends string,
	infer V,
]
	? { [key in K]: V }
	: never;

export type FromEntries<T extends readonly [string, unknown]> = MergeUnion<
	T extends infer U extends readonly [string, unknown] ? EntryToObject<U> : never
>;

export function typeSafeFromEntries<const T extends readonly [string, unknown]>(entries: T[]) {
	return Object.fromEntries(entries) as FromEntries<T>;
}
