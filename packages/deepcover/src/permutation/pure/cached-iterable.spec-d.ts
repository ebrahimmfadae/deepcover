import { cachedIterable, type CachedIterable } from '#src/permutation/pure/cached-iterable';

describe('Test cached iterable', () => {
	it('primitive iterable cached type is valid', () => {
		const input = [2, 'value0'] as const;
		const output = cachedIterable(input);
		expectTypeOf(output).toEqualTypeOf<CachedIterable<(typeof input)[number]>>();
	});
});
