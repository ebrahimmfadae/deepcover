import { freezeOnce } from '#src/utils/utils';

describe('freezeOnce', () => {
	it('1', () => {
		const input0 = { a: 1, b: 2 } as { a: 1; b: 2 };
		const output = freezeOnce(input0);
		type A = {
			readonly a: 1;
			readonly b: 2;
		};
		expectTypeOf(output).toEqualTypeOf<A>();
	});
});
