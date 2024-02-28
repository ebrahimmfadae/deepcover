import { REMOVE } from "./permutation"
import { TupleToUnion } from "./types/common.type"
import {
  DeepMergeUnion,
  HardMerge,
  MergeIntersection,
} from "./types/merge.type"
import { cachedGenerator } from "./utils"

export type GeneratorReturnType<T extends () => Generator> =
  T extends () => Generator<infer U> ? U : never
type NotDefined = typeof REMOVE
type FixedSymbolCheck<T> =
  Extract<T, NotDefined> extends never ? void : typeof REMOVE
type OptionalKeys<T extends object> = {
  [K in keyof T]: FixedSymbolCheck<T[K]> extends NotDefined ? K : never
}[keyof T]
type AddQuestionMark<
  T extends object,
  O extends OptionalKeys<T> = OptionalKeys<T>,
> = MergeIntersection<
  { [K in O]?: Exclude<T[K], typeof REMOVE> } & {
    [K in Exclude<keyof T, O>]: T[K]
  }
>
export type ObjectGenerator<T extends Record<string, () => Generator>> =
  AddQuestionMark<{ [K in keyof T]: GeneratorReturnType<T[K]> }>
export type TupleRemap<T extends (() => Generator)[]> = {
  [K in keyof T]: GeneratorReturnType<T[K]>
}

export function counter(start = 0) {
  return function* () {
    for (let i = start; ; i++) {
      yield i
    }
  }
}

export function max<const T>(generator: () => Generator<T>, max: number) {
  const g = generator()
  return function* () {
    for (let i = 0; i < max; i++) {
      const { value, done } = g.next()
      if (done) return value
      yield value
    }
  }
}

export function append<
  const T extends Record<string, unknown>,
  U extends () => Generator<Record<string, unknown>, void>,
  R = DeepMergeUnion<HardMerge<T, GeneratorReturnType<U>>>,
>(
  generator: () => Generator<T, void>,
  permute: (permutation: T) => U,
): () => Generator<R> {
  const g = generator()
  return function* () {
    for (const v of g) {
      for (const u of permute(v)()) {
        yield { ...v, ...u } as R
      }
    }
  }
}

export function appendInfinite<
  const T extends Record<string, unknown>,
  U extends () => Generator<Record<string, unknown>, void>,
  R = HardMerge<T, GeneratorReturnType<U>>,
>(generator: () => Generator<T>, permute: U): () => Generator<R> {
  const g = generator()
  return function* () {
    const p = permute()
    for (const v of g) {
      const { done, value } = p.next()
      if (done) throw Error("Illegal state")
      yield { ...v, ...value } as R
    }
  }
}

export function enums<const T extends any[]>(
  enums: T,
): () => Generator<TupleToUnion<T>, void> {
  return function* () {
    yield* enums
  }
}

export function tuple<const T, const U extends (() => Generator<T>)[]>(
  enums: [...U],
): () => Generator<TupleRemap<U>> {
  return function* () {
    if (enums.length === 1) {
      for (const value of enums[0]()) {
        yield [value] as TupleRemap<U>
      }
    } else {
      const [head, ...rest] = enums
      const cachedYieldPermute = cachedGenerator(tuple(rest)())
      for (const value of head()) {
        for (const subPermutation of cachedYieldPermute()) {
          yield [value, ...subPermutation] as TupleRemap<U>
        }
      }
    }
  }
}

export function object<const T extends Record<string, () => Generator>>(
  input: T,
): () => Generator<ObjectGenerator<T>> {
  return function* () {
    const allKeys = Object.keys(input) as (keyof T)[]
    if (allKeys.length === 0) {
      yield {} as ObjectGenerator<T>
      return
    }
    const pivotKey = allKeys[0]
    const element = input[pivotKey]
    if (allKeys.length === 1) {
      for (const value of element!()) {
        if (value === REMOVE) yield {} as ObjectGenerator<T>
        else yield { [pivotKey]: value } as ObjectGenerator<T>
      }
    } else {
      const shallowClone = { ...input }
      delete shallowClone[pivotKey]
      const cachedYieldPermute = cachedGenerator(object(shallowClone)())
      for (const value of element!()) {
        for (const subPermutation of cachedYieldPermute()) {
          const p =
            value === REMOVE
              ? {}
              : ({ [pivotKey]: value } as ObjectGenerator<T>)
          yield Object.assign({}, subPermutation, p) as ObjectGenerator<T>
        }
      }
    }
  }
}

export function one<const T>(value: T) {
  return function* () {
    yield value
  }
}

export function optional<const T>(
  generator: () => Generator<T | typeof REMOVE>,
) {
  const g = generator()
  return function* () {
    yield* g
    yield REMOVE
  }
}
