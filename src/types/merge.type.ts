import type { PlainType } from '#src/types/common.type';
import type { AllKeys, NonCommonKeys, PickTypeOf, PickTypeOf2 } from '#src/types/union.type';

export type HardMerge<Destination, Source> = {
	[K in keyof Destination as K extends keyof Source ? never : K]: Destination[K];
} & Source;
export type MergeIntersection<T extends object> = PlainType<{
	[K in keyof T]: T[K];
}>;
type MergeUnionByKeys<T extends object, U extends keyof T> = {
	[K in U]: [T[K]] extends [Record<string, unknown>] ? DeepMergeUnion<T[K]> : PickTypeOf<T, K>;
};
export type DeepMergeUnion<T> =
	| Exclude<T, object>
	| MergeIntersection<
			MergeUnionByKeys<Extract<T, object>, AllKeys<Extract<T, object>>> &
				MergeUnionByKeys<Extract<T, object>, NonCommonKeys<Extract<T, object>>>
	  >;

export type UnionToIntersection<
	T extends Record<string, unknown>,
	U extends AllKeys<T> = AllKeys<T>,
> = {
	[K in U]: PickTypeOf2<T, K>;
} extends infer K
	? K
	: never;
