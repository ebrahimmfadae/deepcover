import { explicitPermutations } from '#src/permutation/pure/explicit-permutations';
import { REMOVE } from '#src/permutation/symbols';

export type Combinations<T extends readonly unknown[]> = Set<T[number]>;

export function* combinations<const T extends readonly unknown[]>(
	input: T,
	limits: { min?: number; max?: number } = {},
): Generator<Combinations<T>, void, unknown> {
	const { min = 1, max = input.length } = limits;
	const slots = input.map((v) => [v, REMOVE] as const);
	for (const element of explicitPermutations(slots)) {
		const f = element.filter((v) => v !== REMOVE);
		if (f.length >= min && f.length <= max) yield new Set(f);
	}
}
