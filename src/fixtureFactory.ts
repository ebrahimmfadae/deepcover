import { CompareResult } from "./compare"
import { GeneratorReturnType } from "./permutationGenerators"
import { AllKeys, PartialRecord } from "./utils.type"

export type UpdatedObject<TBase, TData> = {
  base: TBase
  data: TData
  mutatedFields: CompareResult<string>[]
}

export function factory<TActions extends string>() {
  type FunctionSchema = (...args: any[]) => unknown
  type KeepFunctions<T> = T extends FunctionSchema ? T : never
  type MutationFunction<T, R extends T = T> = (base: T, payload: any) => R
  type PermutationMapSchema = PartialRecord<
    TActions,
    () => () => Generator<UpdatedObject<unknown, unknown> | unknown>
  >
  return {
    permutation() {
      return function <U extends PermutationMapSchema>(object: U) {
        return object
      }
    },
    fill<T extends PermutationMapSchema>() {
      type FillSchema = {
        [K in AllKeys<T>]?: MutationFunction<
          GeneratorReturnType<ReturnType<KeepFunctions<T[K]>>>
        >
      }
      return function <U extends FillSchema>(object: U) {
        return object
      }
    },
    assert<T extends PermutationMapSchema>() {
      type AssertSchema = {
        [K in AllKeys<T>]?: MutationFunction<
          GeneratorReturnType<ReturnType<KeepFunctions<T[K]>>>
        >
      }
      return function <U extends AssertSchema>(object: U) {
        return object
      }
    },
  }
}
