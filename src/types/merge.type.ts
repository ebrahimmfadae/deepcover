import type { PlainType } from './common.type.js';
import type { AllKeys, NonCommonKeys, PickTypeOf } from './union.type.js';

export type HardMerge<Destination, Source> = {
	[K in keyof Destination as K extends keyof Source ? never : K]: Destination[K];
} & Source;
export type MergeIntersection<T extends object> = PlainType<{
	[K in keyof T]: T[K];
}>;
type MergeUnionByKeys<T extends object, U extends keyof T> = {
	[K in U]: [T[K]] extends [Record<string, unknown>] ? DeepMergeUnion<T[K]> : PickTypeOf<T, K>;
};
export type DeepMergeUnion<T extends object> = MergeIntersection<
	MergeUnionByKeys<T, AllKeys<T>> & MergeUnionByKeys<T, NonCommonKeys<T>>
>;
