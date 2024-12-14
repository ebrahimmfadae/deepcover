import { deepMerge } from '#src/utils/merge';

describe('deepMerge', () => {
	it('1', () => {
		const input0 = { a: 1, b: 2 } as const;
		const input1 = { c: 3 } as const;
		const output = deepMerge(input0, input1);
		type A =
			| {
					readonly a: 1;
					readonly b: 2;
			  }
			| {
					readonly c: 3;
			  };
		expectTypeOf(output).toEqualTypeOf<A>();
	});
});
