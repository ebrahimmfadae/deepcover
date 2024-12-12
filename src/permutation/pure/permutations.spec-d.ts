import { permutations } from '#src/permutation/pure/permutations';

describe('Test pure permutations', () => {
	it('pure permutations type is valid', () => {
		const input = [2, 'value0'] as const;
		const output = permutations(input, { size: 2, exclusive: true, combination: true });
		type A = ReadonlySet<(typeof input)[number]> & {
			readonly size: 2;
		};
		expectTypeOf(output).toEqualTypeOf<Generator<A, void, unknown>>(output);
	});
	it('pure permutations type is valid', () => {
		const input = [2, 'value0'] as const;
		const output = permutations(input, { size: 2, exclusive: true, combination: false });
		type A = readonly [2 | 'value0', 2 | 'value0'];
		expectTypeOf(output).toEqualTypeOf<Generator<A, void, unknown>>(output);
	});
	it('pure permutations type is valid', () => {
		const input = [2, 'value0'] as const;
		const output = permutations(input, { size: 2, exclusive: false, combination: false });
		type A = readonly [2 | 'value0', 2 | 'value0'];
		expectTypeOf(output).toEqualTypeOf<Generator<A, void, unknown>>(output);
	});
	it('pure permutations type is valid', () => {
		const input = [2, 'value0'] as const;
		const output = permutations(input, { size: 2, exclusive: false, combination: true });
		type A = ReadonlySet<(typeof input)[number]> & {
			readonly size: 2;
		};
		expectTypeOf(output).toEqualTypeOf<Generator<A, void, unknown>>(output);
	});
	it('pure permutations type is valid', () => {
		const input = [2, 'value0'] as const;
		const output = permutations(input);
		type A = readonly [2 | 'value0'];
		expectTypeOf(output).toEqualTypeOf<Generator<A, void, unknown>>(output);
	});
});
