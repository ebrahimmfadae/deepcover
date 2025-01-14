import { parallelPermutations } from '#src/permutation/pure/parallel-permutations';

describe('Test parallel permutations', () => {
	it('parallel permutations type is valid', () => {
		const input0 = [2, 'value0'] as const;
		const input1 = [1, 3, 4] as const;
		const output = parallelPermutations([input0, input1]);
		type A = readonly [2 | 'value0', 1 | 3 | 4];
		expectTypeOf(output).toEqualTypeOf<Generator<A, void, unknown>>();
	});
});
