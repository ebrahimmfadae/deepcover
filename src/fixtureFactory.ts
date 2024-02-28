import { GeneratorReturnType } from "./permutationGenerators"
import { AllKeys, DeepSoftMerge, PartialRecord, SoftMerge } from "./utils.type"

export type Permutation = {
  precondition?: PartialRecord<string, unknown>
  payload: unknown
}

export function factory<TActions extends string>() {
  type FunctionSchema = (...args: any[]) => unknown
  type KeepFunctions<T> = T extends FunctionSchema ? T : never
  type MutationFunction<T, R extends T = T> = (base: T, payload: any) => R
  type PermutationSchema = PartialRecord<
    TActions,
    () => () => Generator<Permutation>
  >
  return {
    permutation() {
      return function <U extends PermutationSchema>(object: U) {
        return object
      }
    },
    populate<T extends PermutationSchema>() {
      type Schema = {
        [K in AllKeys<T>]?: MutationFunction<
          DeepSoftMerge<GeneratorReturnType<ReturnType<KeepFunctions<T[K]>>>>
        >
      }
      return function <U extends Schema>(object: U) {
        return object
      }
    },
    assertion<T extends PermutationSchema>() {
      type Schema = {
        [K in AllKeys<T>]?: MutationFunction<
          GeneratorReturnType<ReturnType<KeepFunctions<T[K]>>>
        >
      }
      return function <U extends Schema>(object: U) {
        return object
      }
    },
  }
}
