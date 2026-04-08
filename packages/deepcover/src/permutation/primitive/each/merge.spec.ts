import type { PermutationGenerator } from '#src/permutation/definitions';
import { expectToBeEach, generateEachFixtures } from '#src/permutation/primitive/each/each.fixture';

function fixtures() {
	return generateEachFixtures([1, 2]).map((a) => ({
		name: a.name,
		e: generateEachFixtures([1, 2, 3, 4]).map((b) => ({
			name: b.name,
			result: b.name,
			create() {
				return a.create().merge(b.create());
			},
			expect(v: PermutationGenerator) {
				expectToBeEach(v, b.input, b.shouldBeOptional);
			},
		})),
	}));
}

for (const { name, e } of fixtures()) {
	describe(name, () => {
		for (const e1 of e)
			test(`.merge(${e1.name}) => ${e1.result}`, () => e1.expect(e1.create()));
	});
}
