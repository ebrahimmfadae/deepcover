import { combo } from '#src/permutation/combo';
import type { InferPermutationType, PermutationGenerator } from '#src/permutation/definitions';
import { explicitPermutations } from '#src/permutation/pure/explicit-permutations';

/**
 * This function performs cartesian mutate. Meaning that it will first mutate all `a` permutations respected to `limits` value,
 * then it will perform a cartesian product between `a` and `b`.
 *
 * Keep in mind that `before` and `after` values are not meant to be different only by one field.
 */
export function* mutate<T extends PermutationGenerator, U extends PermutationGenerator>(
	a: T,
	b: U,
	limits?: { max?: number },
): Generator<{ before: InferPermutationType<T>; after: unknown }, void, unknown> {
	const merged = a.override(combo(b, limits));
	const permutations = explicitPermutations([a(), merged()]);
	yield* permutations.map((v) => ({ before: v[0] as InferPermutationType<T>, after: v[1] }));
}
