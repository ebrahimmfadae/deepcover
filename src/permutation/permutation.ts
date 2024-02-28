import { object } from "./permutationGenerators"

export const REMOVE = Symbol.for("REMOVE")

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
export function permute<T extends Record<string, () => Generator>>(input: T) {
  return Array.from(object(input)())
}
