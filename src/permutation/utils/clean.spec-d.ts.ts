import { REMOVE } from '#src/permutation/symbols';
import { cleanRemoveValues } from '#src/permutation/utils/clean';

describe('cleanRemoveValues', () => {
	it('1', () => {
		const input0 = { a: 1, b: REMOVE } as const;
		const output = cleanRemoveValues(input0);
		type A =
			| {
					readonly a: 1;
					readonly b: REMOVE;
			  }
			| undefined;
		expectTypeOf(output).toEqualTypeOf<A>();
	});
});
