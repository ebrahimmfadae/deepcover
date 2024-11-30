export type EntryKey = string | number | readonly [number];
export type ConcatKey<Prefix extends readonly EntryKey[], K extends EntryKey> = readonly [
	...Prefix,
	K,
];
export type CastAsArray<T> = T extends readonly unknown[] ? T : never;
export type CastArrayKeyAsNumber<T extends PropertyKey> = T extends number
	? T
	: T extends `${infer P extends number}`
		? P
		: never;
