import type { PermutationGenerator } from '#src/permutation/definitions';
import { serializeArgs } from '#src/permutation/primitive/common.fixture';
import { expectToBeEach, generateEachFixtures } from '#src/permutation/primitive/each/each.fixture';
import type { IterableElement } from 'type-fest';

function fixtures() {
	return generateEachFixtures([1, 2]).map((a) => ({
		name: a.name,
		e: generateEachFixtures([3, 4]).map((b) => {
			const result = getResult(a, b);
			return {
				name: b.name,
				result: result.name,
				create() {
					return a.create().outputMerge(b.create());
				},
				expect(v: PermutationGenerator) {
					expectToBeEach(v, result.input, result.shouldBeOptional);
				},
			};
		}),
	}));
}

function getResult(
	a: IterableElement<ReturnType<typeof generateEachFixtures<readonly [1, 2]>>>,
	b: IterableElement<ReturnType<typeof generateEachFixtures<readonly [3, 4]>>>,
) {
	if (a.input.length === 0 && b.input.length === 0)
		return { name: `each()`, input: [], shouldBeOptional: false };
	if (a.input.length === 0)
		return { name: b.name, input: b.input, shouldBeOptional: b.shouldBeOptional };
	if (b.input.length === 0)
		return { name: a.name, input: a.input, shouldBeOptional: a.shouldBeOptional };
	if (a.shouldBeOptional && b.shouldBeOptional) {
		const input = [...a.input, ...b.input];
		return {
			name: `optional(each(${serializeArgs(input)}))`,
			input,
			shouldBeOptional: true,
		};
	}
	if (!b.shouldBeOptional) return { name: b.name, input: b.input, shouldBeOptional: false };
	else {
		const input = [...a.input, ...b.input];
		return {
			name: `each(${serializeArgs(input)})`,
			input,
			shouldBeOptional: false,
		};
	}
}

for (const { name, e } of fixtures()) {
	describe(name, () => {
		for (const e1 of e)
			test(`.outputMerge(${e1.name}) => ${e1.result}`, () => e1.expect(e1.create()));
	});
}
