import { cachedGenerator, isPOJO, typeSafeIsArray } from "./utils"
import { Expandable, PlainType, UnionTuple } from "./utils.type"

export const REMOVE = Symbol.for("REMOVE")

type NotDefined = typeof REMOVE
type FixedSymbolCheck<T> =
  Extract<T, NotDefined> extends never ? void : typeof REMOVE
type ExtractOptionalKeys<T> = {
  [K in keyof T]: FixedSymbolCheck<T[K]> extends NotDefined ? K : never
}[keyof T]
type MakeOptional<T> = PlainType<
  {
    [K in ExtractOptionalKeys<T>]?: T[K]
  } & {
    [K in Exclude<keyof T, ExtractOptionalKeys<T>>]: T[K]
  }
>
type FlatArrayTypes<T> = PlainType<{
  [K in keyof T]: T[K] extends readonly any[] | any[] ? UnionTuple<T[K]> : T[K]
}>
type PruneRemoveSymbol<T> = PlainType<{
  [K in keyof T]: Exclude<T[K], typeof REMOVE>
}>
export type Permuted<T> = PruneRemoveSymbol<MakeOptional<FlatArrayTypes<T>>>
export type DeepPermutedArray<T extends readonly unknown[]> =
  T extends readonly [readonly [...infer U]]
    ? [{ [K in keyof U]: DeepPermuted<U[K]> }]
    : UnionTuple<
        { [K in keyof T]: DeepPermuted<T[K]> } extends readonly [...infer U]
          ? U
          : never
      >
export type DeepPermuted<T> = T extends readonly unknown[]
  ? DeepPermutedArray<T>
  : Expandable<T> extends T
    ? Permuted<{ [K in keyof T]: DeepPermuted<T[K]> }>
    : T

/**
 * Generates permutations based on provided input
 *
 * * In order to provide a field with an array type you must scape the brackets with `[[` and `]]` \
 * instead of single `[` and `]`.
 * * Use the `REMOVE` symbol to include not defined permutations for a field. The `null` and `undefined` values are not considered as not defined values.
 * The optional (`?`) symbol is used to demonstrate not defined ones.
 *
 * @param input in form of `{ foo: [ 'bar' ] }` or \
 * short-hand notation for a field with single permutation `{ foo: 'bar' }`
 * @returns array of permutations
 */
export function permute<T extends object>(input: T): DeepPermuted<T>[] {
  return Array.from(yieldPermute(input))
}

export function getFirstPermutation<T extends object>(
  input: T,
): DeepPermuted<T> {
  return getPermutationAt(input, 0) as DeepPermuted<T>
}

export function getPermutationAt<T extends object>(
  input: T,
  index: number,
): DeepPermuted<T> | undefined {
  let inc = index
  for (const result of yieldPermute(input)) {
    if (inc-- === 0) return result
  }
  return undefined
}

export function* permuteTuple<T extends [...any]>(
  input: T,
): Generator<DeepPermuted<T>> {
  const isTuple = input.length === 1 && Array.isArray(input[0])
  if (isTuple && input[0].length > 1) {
    const [head, ...rest] = input[0] as [object, ...object[]]
    for (const v1 of yieldPermute(head)) {
      for (const v2 of yieldPermute([rest]) as Generator<[...any]>) {
        yield [v1, ...v2] as DeepPermuted<T>
      }
    }
  } else if (isTuple) {
    for (const v of yieldPermute(input[0][0])) {
      yield [v] as DeepPermuted<T>
    }
  } else {
    for (const v of input) {
      yield* yieldPermute(v) as Generator<any>
    }
  }
}

export function* permuteObject<T extends object>(
  input: T,
): Generator<DeepPermuted<T>> {
  const allKeys = Object.keys(input) as (keyof T)[]
  if (allKeys.length === 0) {
    yield input as unknown as DeepPermuted<T>
    return
  }
  const pivotKey = allKeys[0]
  const element = input[pivotKey]
  const values = typeSafeIsArray(element) ? element : [element]
  if (allKeys.length === 1) {
    for (const value of yieldPermute(values)) {
      if (value === REMOVE) yield {} as DeepPermuted<T>
      else yield { [pivotKey]: value } as DeepPermuted<T>
    }
  } else {
    const shallowClone = { ...input }
    delete shallowClone[pivotKey]
    const cachedYieldPermute = cachedGenerator(yieldPermute(shallowClone))
    for (const value of yieldPermute(values)) {
      for (const subPermutation of cachedYieldPermute()) {
        const result =
          value === REMOVE
            ? Object.assign({}, subPermutation)
            : Object.assign({}, subPermutation, { [pivotKey]: value })
        yield result
      }
    }
  }
}

export function* yieldPermute<T extends object>(
  input: T,
): Generator<DeepPermuted<T>> {
  if (Array.isArray(input)) {
    yield* permuteTuple(input) as any
  } else if (isPOJO(input)) {
    yield* permuteObject(input) as any
  } else {
    yield input
    return
  }
}
