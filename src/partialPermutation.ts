import { compare } from "./compare"
import { DeepPermuted, permute } from "./permutation"
import { subsetWithSize } from "./subset"
import { MergeTwo } from "./utils.type"

/**
 * Merges each permuted `seed` object with the `base` object to generate an array of permutations.
 * If a `subsetSize` is specified, permutations are generated from `seed` subsets of that size;
 * otherwise, the entire `seed` object is used.
 *
 * @param base - The base object that remains unchanged.
 * @param seed - The object to permute and merge with base.
 * @param subsetSize - Optional. size of seed subsets for permutation.
 * @returns An array of objects, each containing a merged `data` object and a list of `mutatedFields`.
 */
export function partialPermute<T extends object, S extends object>(
  base: T,
  seed: S,
  subsetSize?: number,
) {
  const seeds = subsetSize ? subsetWithSize(seed, subsetSize) : [seed]
  return seeds.flatMap((mutationObject) => {
    const baseWithSeedsEntries = Object.entries(base).map(([key, value]) => {
      const escapedArrayValue = [value]
      const outputValue =
        key in mutationObject
          ? mutationObject[key as keyof S]
          : escapedArrayValue
      return [key, outputValue]
    })
    const baseWithSeedsObject = Object.fromEntries(baseWithSeedsEntries)
    const merged: object = { ...mutationObject, ...baseWithSeedsObject }
    return permute(merged).map((data) => {
      return {
        base,
        data: data as Partial<MergeTwo<T, DeepPermuted<S>>>,
        mutatedFields: compare(base, data as object),
      } as const
    })
  })
}
