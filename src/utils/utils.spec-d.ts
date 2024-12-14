import { idempotentFreeze } from '#src/utils/utils';

describe('idempotentFreeze', () => {
	it('1', () => {
		const input0 = { a: 1, b: 2 } as { a: 1; b: 2 };
		const output = idempotentFreeze(input0);
		type A = {
			readonly a: 1;
			readonly b: 2;
		};
		expectTypeOf(output).toEqualTypeOf<A>();
	});
});
