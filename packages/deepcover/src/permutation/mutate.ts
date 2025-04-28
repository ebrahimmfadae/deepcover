import type { PermutationGenerator } from '#src/permutation/definitions';
import { combinations } from '#src/permutation/pure/combinations';
import { explicitPermutations } from '#src/permutation/pure/explicit-permutations';

export function* mutate(
	a: PermutationGenerator,
	b: PermutationGenerator,
	limits: { max?: number } = {},
): Generator<unknown, void, unknown> {
	const { max = b.primitivePermutationPaths.length } = limits;
	const p = combinations(b.primitivePermutationPaths, { min: 1, max });
	const validIndices = p.filter((v) => {
		const indices = [...v].map((v) => v.match(/#(\d+)/)?.[1]);
		return new Set(indices).size === 1;
	});
	for (const element of validIndices) {
		const extracted = b.extract([...element]);
		const merged = a.override(extracted);
		yield* explicitPermutations([a(), merged()]).map((v) => ({ before: v[0], after: v[1] }));
	}
}
