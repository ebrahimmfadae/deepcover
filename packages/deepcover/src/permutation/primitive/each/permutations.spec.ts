import type { PermutationGenerator } from '#src/permutation/definitions';
import {
	eachInputValues,
	expectToBeEach,
	generateEachFixtures,
} from '#src/permutation/primitive/each/each.fixture';

const fixtures = generateEachFixtures(eachInputValues).map(
	({ name, input, shouldBeOptional, create }) => ({
		name,
		create,
		expect(v: PermutationGenerator) {
			expectToBeEach(v, input, shouldBeOptional);
		},
	}),
);

for (const e of fixtures) test(e.name, () => e.expect(e.create()));
