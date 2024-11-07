import type { PlainType } from '#src/types/common.type';
import type { AllKeys, NonCommonKeys, PickTypeOf, PickTypeOf2 } from '#src/types/union.type';

export type HardMerge<Destination, Source> = {
	[K in keyof Destination as K extends keyof Source ? never : K]: Destination[K];
} & Source;
export type MergeIntersection<T extends object> = PlainType<{
	[K in keyof T]: T[K];
}>;
type DeepMergeUnionByKeys<T extends object, U extends keyof T> = {
	[K in U]: [T[K]] extends [Record<string, unknown>] ? DeepMergeUnion<T[K]> : PickTypeOf<T, K>;
};
export type DeepMergeUnion<T> =
	| Exclude<T, object>
	| MergeIntersection<
			DeepMergeUnionByKeys<Extract<T, object>, AllKeys<Extract<T, object>>> &
				DeepMergeUnionByKeys<Extract<T, object>, NonCommonKeys<Extract<T, object>>>
	  >;
type MergeUnionByKeys<T extends object, U extends keyof T> = {
	[K in U]: PickTypeOf<T, K>;
};
export type MergeUnion<T> =
	| Exclude<T, object>
	| MergeIntersection<
			MergeUnionByKeys<Extract<T, object>, AllKeys<Extract<T, object>>> &
				MergeUnionByKeys<Extract<T, object>, NonCommonKeys<Extract<T, object>>>
	  >;

export type SquashObjectUnion<
	T extends Record<string, unknown>,
	U extends AllKeys<T> = AllKeys<T>,
> = {
	[K in U]: PickTypeOf2<T, K>;
} extends infer K
	? K
	: never;

export type HardMergeTuple<T extends Record<string, unknown>[]> = T extends [
	infer U,
	...infer P extends Record<string, unknown>[],
]
	? HardMerge<U, HardMergeTuple<P>>
	: unknown;
