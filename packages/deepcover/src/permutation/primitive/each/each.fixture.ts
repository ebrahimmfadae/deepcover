import type { PermutationGenerator } from '#src/permutation/definitions';
import { optional } from '#src/permutation/modifiers/optional';
import { checkPermutationType } from '#src/permutation/primitive/check-permutation-type';
import { serializeArgs } from '#src/permutation/primitive/common.fixture';
import { each } from '#src/permutation/primitive/each/each';
import { concat } from '#src/permutation/pure/concat';
import { explicitPermutations } from '#src/permutation/pure/explicit-permutations';
import { permutations } from '#src/permutation/pure/permutations';

const truthy = [true, 1, 'value', {}, [], Symbol('symbol')] as const;
const falsy = [false, 0, '', undefined, null] as const;
export const eachInputValues = [...truthy, ...falsy] as const;

export function* generateEachFixtures<const T extends readonly unknown[]>(values: T) {
	yield* explicitPermutations([
		[{ shouldBeOptional: false }, { shouldBeOptional: true }],
		concat(
			permutations(values, { size: 0, exclusive: true }),
			permutations(values, { size: 1, exclusive: true }),
			permutations(values, { size: 2, exclusive: true }),
		),
	]).map(([{ shouldBeOptional }, input]) => ({
		name: shouldBeOptional
			? `optional(each(${serializeArgs(input)}))`
			: `each(${serializeArgs(input)})`,
		input,
		shouldBeOptional,
		structure: 'primitive' as const,
		create() {
			const generator = each(...input);
			return shouldBeOptional ? optional(generator) : generator;
		},
	}));
}

export function expectToBeEach(
	v: PermutationGenerator,
	input: readonly unknown[],
	shouldBeOptional?: boolean,
) {
	if (input.length === 0) return expect(checkPermutationType(v, 'never')).toBe(true);
	expect(input.length).greaterThan(0);
	expect(new Set(v)).toStrictEqual(new Set(input));
	expect(v.size).toBe(BigInt(input.length));
	expect(v.permutationPaths).toStrictEqual([]);
	expect(v.primitivePermutationPaths).toStrictEqual([]);
	expect(v.type).toBe('each');
	expect(v.structure).toBe('primitive');
	expect(v.originalInputArg).containSubset(input);
	expect(input).containSubset(v.originalInputArg);
	expect(v.modifiers).toStrictEqual(shouldBeOptional ? ['optional'] : []);
}
