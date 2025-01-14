import { combinations } from '#src/permutation/pure/combinations';
import type { REMOVE } from '#src/permutation/symbols';

describe('Test combinations', () => {
	it('combinations type is valid', () => {
		const input0 = [2, 'value0'] as const;
		const input1 = [1, 3, 4] as const;
		const output = combinations({ input0, input1 });
		type A = {
			readonly input0: 2 | REMOVE | 'value0';
			readonly input1: 1 | REMOVE | 3 | 4;
		};
		expectTypeOf(output).toEqualTypeOf<Generator<A, void, unknown>>();
	});
	it('2', () => {
		const input0 = [2, 'value0'] as const;
		const input1 = [1, 3, 4] as const;
		const output = combinations([input0, input1]);
		type A = readonly [2 | 'value0' | typeof REMOVE, 1 | 3 | 4 | typeof REMOVE];
		expectTypeOf(output).toEqualTypeOf<Generator<A, void, unknown>>();
	});
});
