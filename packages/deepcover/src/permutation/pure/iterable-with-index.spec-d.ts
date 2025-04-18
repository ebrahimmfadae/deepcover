import { iterableWithIndex } from '#src/permutation/pure/iterable-with-index';

describe('Test iterable with index', () => {
	it('indexed primitive iterable type is valid', () => {
		const input = [2, 'value0'] as const;
		const output = iterableWithIndex(input);
		type A = readonly [(typeof input)[number], number];
		expectTypeOf(output).toEqualTypeOf<Iterable<A>>();
	});
});
