import type { PermutationGenerator } from '#src/permutation/definitions';
import { checkPermutationType } from '#src/permutation/primitive/check-permutation-type';
import { serializeArgs, type Base } from '#src/permutation/primitive/common.fixture';
import { each } from '#src/permutation/primitive/each/each';
import { cachedIterable } from '#src/permutation/pure/cached-iterable';
import { concat } from '#src/permutation/pure/concat';
import { permutations } from '#src/permutation/pure/permutations';

// const truthy = [true, 1, 'value', {}, [], Symbol('symbol')] as const;
// const falsy = [false, 0, '', undefined, null] as const;
// const values = [...truthy, ...falsy] as const;
const values = [1, 2] as const;
export const eachFixtures = cachedIterable(
	concat(
		permutations(values, { size: 0 }),
		permutations(values, { size: 1 }),
		// permutations(values, { size: 2 }),
	).map(
		(input) =>
			({
				name: `each(${serializeArgs(input)})`,
				input,
				primitive: true,
				output: input,
				primitivePaths: [],
				paths: [],
				generator: each(...input),
			}) satisfies Base,
	),
);

export function expectEach(
	v: PermutationGenerator,
	input: readonly unknown[] = [],
	shouldBeOptional = false,
) {
	if (input.length === 0) return expect.assert(checkPermutationType(v, 'never'));
	expect(input.length).greaterThan(0);
	expect(new Set(v)).toStrictEqual(new Set(input));
	expect(v.size).toBe(BigInt(input.length));
	expect(v.permutationPaths).toStrictEqual([]);
	expect(v.primitivePermutationPaths).toStrictEqual([]);
	expect(v.type).toBe('each');
	expect(v.structure).toBe('primitive');
	expect(v.modifiers).toStrictEqual(shouldBeOptional ? ['optional'] : []);
	expect(v.originalInputArg).toStrictEqual(input);
}
