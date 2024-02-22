export type UnionTuple<T extends readonly unknown[]> = T[number];
export type PlainType<T> = T extends infer P ? P : never;
export type MergeTwo<T, U> = PlainType<{
  [K in keyof T | keyof U]: K extends keyof T & keyof U
    ? T[K] | U[K] extends unknown[]
      ? [MergeArray<T[K] | U[K]>]
      : T[K] | U[K]
    : K extends keyof U
      ? U[K]
      : K extends keyof T
        ? T[K]
        : never;
}>;
export type Expandable<T> = T extends Record<string, unknown> ? T : void;
export type MergeArray<T> = T extends (infer U)[] ? U : T;
export type Primitive = string | number | bigint | boolean | null | undefined;
export type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>;
export interface PojoArray extends Array<Pojo> {}
export type Pojo = Primitive | PojoArray | { [x: string]: Pojo };
type ToPrimitive<T> = T extends number
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
            : never;
export type Loosen<T> = T extends Primitive
  ? ToPrimitive<T>
  : {
      [K in keyof T]: T[K] extends Primitive
        ? ToPrimitive<T[K]>
        : T[K] extends Record<string, unknown> | readonly unknown[]
          ? Loosen<T[K]>
          : T[K];
    };
