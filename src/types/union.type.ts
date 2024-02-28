import { PartialRecord } from "./common.type"

export type AllKeys<T> = T extends unknown ? keyof T : never
export type CommonKeys<T extends object> = keyof T
export type NonCommonKeys<T extends object> = Exclude<AllKeys<T>, CommonKeys<T>>
export type PickType<T, K extends AllKeys<T>> =
  T extends Record<string, never>
    ? never
    : T extends PartialRecord<K, unknown>
      ? T[K]
      : undefined
export type PickTypeOf<T, K extends string | number | symbol> =
  K extends AllKeys<T> ? PickType<T, K> : never
