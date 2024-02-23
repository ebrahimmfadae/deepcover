import { CompareResult } from "./compare"
import { DeepPermuted } from "./permutation"
import { Loosen, PartialRecord } from "./utils.type"

export type Seed = {
  VALID?: any
  INVALID?: any
}

export type MutationFunction<T> = (base: T, payload: any) => unknown

export function factory<TActions extends string>() {
  type FunctionSchema<T = Readonly<unknown>> = (...args: any[]) => T
  type PermutationMapSchema = PartialRecord<
    TActions,
    (...args: any[]) => readonly unknown[]
  >
  type PermutationFunction<T, R> = (
    base: DeepPermuted<T>,
    payload: unknown,
  ) => R
  return {
    permutation<T extends Seed, TValid = T["VALID"]>() {
      type PermutationSchema = {
        VALID?: PartialRecord<
          TActions,
          PermutationFunction<TValid, readonly unknown[]>
        >
        INVALID?: PartialRecord<
          TActions,
          PermutationFunction<
            TValid,
            | readonly {
                base: DeepPermuted<TValid>
                data: unknown
                mutatedFields: CompareResult<string>[]
              }[]
            | readonly unknown[]
          >
        >
      }
      return function <U extends PermutationSchema>(object: U) {
        return object
      }
    },
    fill<T extends PermutationMapSchema>() {
      type FillSchema = {
        [K in keyof T]?: T[K] extends FunctionSchema
          ? MutationFunction<Loosen<ReturnType<T[K]>[number]>>
          : unknown
      }
      return function <U extends FillSchema>(object: U) {
        return object
      }
    },
    assert<T extends PermutationMapSchema>() {
      type AssertSchema = {
        [K in keyof T]?: T[K] extends FunctionSchema
          ? MutationFunction<ReturnType<T[K]>[number]>
          : unknown
      }
      return function <U extends AssertSchema>(object: U) {
        return object
      }
    },
  }
}
