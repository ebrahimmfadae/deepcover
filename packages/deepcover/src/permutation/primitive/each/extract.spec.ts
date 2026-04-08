import type { PermutationGenerator } from '#src/permutation/definitions';
import {
	eachInputValues,
	expectToBeEach,
	generateEachFixtures,
} from '#src/permutation/primitive/each/each.fixture';

const fixtures = generateEachFixtures(eachInputValues).map(
	({ name, shouldBeOptional, create }) => ({
		name,
		create,
		expect(v: PermutationGenerator) {
			expectToBeEach(v, [], shouldBeOptional);
		},
	}),
);

for (const e of fixtures) {
	describe(e.name, () => {
		test(`.extract() => each()`, () => e.expect(e.create().extract()));
		test(`.extract([]) => each()`, () => e.expect(e.create().extract([])));
		test(`.extract(['key']) => each()`, () => e.expect(e.create().extract(['key'])));
	});
}
