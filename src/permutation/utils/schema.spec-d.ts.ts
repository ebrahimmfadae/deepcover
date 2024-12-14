import { convertToSchema, getPassiveSchemas } from '#src/permutation/utils/schema';
import type { Permutation2 } from '#src/types/permutation.type';

describe('convertToSchema', () => {
	it('1', () => {
		const input0 = {
			size: 2,
			type: 'one',
			passive: false,
			schema: 5,
			allRoutes: [],
			*[Symbol.iterator]() {
				yield 5;
			},
		} as const satisfies Permutation2;
		const output = convertToSchema(input0);
		type A = {
			schema: 5;
			size: 2;
			type: 'one';
			passive: false;
		};
		expectTypeOf(output).toEqualTypeOf<A>();
	});
});

describe('getPassiveSchemas', () => {
	it('1', () => {
		const input0 = {
			size: 2,
			type: 'one',
			passive: true,
			schema: 5,
			allRoutes: [],
			*[Symbol.iterator]() {
				yield 5;
			},
		} as const satisfies Permutation2<5>;
		const output = getPassiveSchemas(input0);
		expectTypeOf(output).toEqualTypeOf<Omit<Permutation2, typeof Symbol.iterator>[]>();
	});
});
