import type { PermutationGenerator } from '#src/permutation/definitions';
import {
	eachInputValues,
	expectToBeEach,
	generateEachFixtures,
} from '#src/permutation/primitive/each/each.fixture';

const fixtures = generateEachFixtures(eachInputValues).map(
	({ name, input, shouldBeOptional, create }) => ({
		name,
		result: name,
		create,
		expect(v: PermutationGenerator) {
			expectToBeEach(v, input, shouldBeOptional);
		},
	}),
);

for (const e of fixtures) {
	describe(e.name, () => {
		test(`.exclude() => ${e.result}`, () => e.expect(e.create().exclude()));
		test(`.exclude([]) => ${e.result}`, () => e.expect(e.create().exclude([])));
		test(`.exclude(['key']) => ${e.result}`, () => e.expect(e.create().exclude(['key'])));
	});
}
