export type TupleToUnion<T extends unknown[]> = T[number]
export type PlainType<T> = T extends infer P ? P : never
export type HardMerge<Destination, Source> = {
  [K in keyof Destination as K extends keyof Source ? never : K]: Destination[K]
} & Source
export type CommonKeys<T extends object> = keyof T
export type AllKeys<T> = T extends unknown ? keyof T : never
export type Subtract<A, C> = A extends C ? never : A
export type NonCommonKeys<T extends object> = Subtract<
  AllKeys<T>,
  CommonKeys<T>
>
export type PickType<T, K extends AllKeys<T>> = T extends { [k in K]?: unknown }
  ? T[K]
  : undefined
export type PickTypeOf<T, K extends string | number | symbol> =
  K extends AllKeys<T> ? PickType<T, K> : never
export type SoftMerge<T extends object> = MergeIntersection<
  {
    [k in CommonKeys<T>]: PickTypeOf<T, k>
  } & {
    [k in NonCommonKeys<T>]?: PickTypeOf<T, k>
  }
>
export type Expandable<T> = T extends Record<string, unknown> ? T : void
export type MergeIntersection<T> = PlainType<{ [K in keyof T]: T[K] }>
export type Primitive = string | number | bigint | boolean | null | undefined
export type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>
export interface PojoArray extends Array<Pojo> {}
export type Pojo = Primitive | PojoArray | { [x: string]: Pojo }
export type ToPrimitive<T> = T extends number
  ? number
  : T extends string
    ? string
    : T extends boolean
      ? boolean
      : T extends bigint
        ? bigint
        : T extends null
          ? null
          : T extends undefined
            ? undefined
            : never
export type Loosen<T> = T extends Primitive
  ? ToPrimitive<T>
  : {
      [K in keyof T]: T[K] extends Primitive
        ? ToPrimitive<T[K]>
        : T[K] extends Record<string, unknown> | readonly unknown[]
          ? Loosen<T[K]>
          : T[K]
    }
