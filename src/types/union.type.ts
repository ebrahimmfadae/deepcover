import type { PartialRecord } from '#src/types/common.type';

export type AllKeys<T> = T extends unknown ? keyof T : never;
export type CommonKeys<T extends object> = keyof T;
export type NonCommonKeys<T extends object> = Exclude<AllKeys<T>, CommonKeys<T>>;
export type PickType<T, K extends AllKeys<T>> =
	T extends Record<string, never>
		? never
		: T extends PartialRecord<K, unknown>
			? T[K]
			: undefined;
export type PickTypeOf<T, K extends PropertyKey> = K extends AllKeys<T> ? PickType<T, K> : never;
export type PickType2<T, K extends AllKeys<T>> =
	T extends Record<string, never> ? never : T extends PartialRecord<K, unknown> ? T[K] : never;
export type PickTypeOf2<T, K extends PropertyKey> = K extends AllKeys<T> ? PickType2<T, K> : never;
