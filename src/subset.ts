/**
 * Generates subset of an input object with provided size
 *
 * @param input any key-value object
 * @param size size of the output subset
 * @returns array of subsets
 */
export function* subsetWithSize<T extends object>(
  input: T,
  size = 1,
): Generator<Partial<T>> {
  // TODO: Calculate combination based on size
  if (size !== 1) throw new Error("Not implemented")
  const keys = Object.keys(input) as (keyof T)[]
  const keyPermutations = keys.map((v) => [v])
  for (const v of keyPermutations) {
    const pick = v.map((u) => [u, input[u]] as const)
    yield Object.fromEntries(pick) as Partial<T>
  }
}
