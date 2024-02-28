export type TupleToUnion<T extends unknown[]> = T[number]
export type PlainType<T> = T extends infer P ? P : never
export type CommonKeys<T extends object> = keyof T
export type AllKeys<T> = T extends unknown ? keyof T : never
export type NonCommonKeys<T extends object> = Exclude<AllKeys<T>, CommonKeys<T>>
export type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>
export type PickType<T, K extends AllKeys<T>> =
  T extends Record<string, never>
    ? never
    : T extends PartialRecord<K, unknown>
      ? T[K]
      : undefined
export type PickTypeOf<T, K extends string | number | symbol> =
  K extends AllKeys<T> ? PickType<T, K> : never
export type Expandable<T> = T extends Record<string, unknown> ? T : void
export type Primitive = string | number | bigint | boolean | null | undefined
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
        : T[K] extends Record<string, unknown> | unknown[]
          ? Loosen<T[K]>
          : T[K]
    }
