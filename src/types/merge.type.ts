import {
  AllKeys,
  CommonKeys,
  NonCommonKeys,
  PickTypeOf,
  PlainType,
} from "./common.type"

export type HardMerge<Destination, Source> = {
  [K in keyof Destination as K extends keyof Source ? never : K]: Destination[K]
} & Source
export type SoftMerge<T extends object> = MergeIntersection<
  {
    [K in CommonKeys<T>]: PickTypeOf<T, K>
  } & {
    [K in NonCommonKeys<T>]?: PickTypeOf<T, K>
  }
>
export type DeepSoftMerge<T extends object> = MergeIntersection<
  {
    [K in AllKeys<T>]: [T[K]] extends [Record<string, unknown>]
      ? DeepSoftMerge<T[K]>
      : PickTypeOf<T, K>
  } & {
    [K in NonCommonKeys<T>]?: [T[K]] extends [Record<string, unknown>]
      ? DeepSoftMerge<T[K]>
      : PickTypeOf<T, K>
  }
>
export type MergeIntersection<T> = PlainType<{ [K in keyof T]: T[K] }>
