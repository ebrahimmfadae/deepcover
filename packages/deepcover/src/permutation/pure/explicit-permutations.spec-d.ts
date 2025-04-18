import { explicitPermutations } from '#src/permutation/pure/explicit-permutations';

describe('Test explicit permutations', () => {
	it('1', () => {
		const input = [2, 'value0'] as const;
		const output = explicitPermutations([input]);
		expectTypeOf(output).toEqualTypeOf<Generator<readonly [2 | 'value0'], void, unknown>>();
	});
	it('2', () => {
		const input0 = [2, 'value0'] as const;
		const input1 = ['value1', 'abc'] as const;
		const output = explicitPermutations([input0, input1]);
		type A = readonly [2 | 'value0', 'value1' | 'abc'];
		expectTypeOf(output).toEqualTypeOf<Generator<A, void, unknown>>();
	});
});
