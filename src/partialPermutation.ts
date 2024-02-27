import { CompareResult, compare } from "./compare"
import { object, one } from "./permutationGenerators"
import { subsetWithSize } from "./subset"

export type UpdatedObject<TBase, TData> = {
  base: TBase
  data: TData
  mutatedFields: CompareResult<string>[]
}

export function convertToPermutation(object: object) {
  const entries = Object.entries(object)
  const mapped = entries.map(([key, value]) => [key, one(value)] as const)
  return Object.fromEntries(mapped) as Record<string, () => Generator>
}

/**
 * Merges each permuted `seed` object with the `base` object to generate an array of permutations.
 * If a `subsetSize` is specified, permutations are generated from `seed` subsets of that size;
 * otherwise, the entire `seed` object is used.
 *
 * @param base - The base object that remains unchanged.
 * @param mutation - The object to permute and merge with base.
 * @param subsetSize - Optional. size of seed subsets for permutation.
 * @returns An array of objects, each containing a merged `data` object and a list of `mutatedFields`.
 */
export function* partialPermute<
  T extends Record<string, unknown>,
  S extends Record<string, () => Generator>,
>(base: T, mutation: S, subsetSize?: number) {
  const seeds = subsetSize
    ? subsetWithSize(mutation, subsetSize)
    : one(mutation)()
  const baseSeed = convertToPermutation(base)
  for (const seed of seeds) {
    const data = { ...baseSeed, ...seed }
    for (const v of object(data)()) {
      yield {
        base,
        data: v,
        mutatedFields: compare(base, data),
      } as const satisfies UpdatedObject<unknown, unknown>
    }
  }
}
