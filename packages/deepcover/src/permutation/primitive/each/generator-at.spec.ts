import type { PermutationGenerator } from '#src/permutation/definitions';
import {
	eachInputValues,
	expectToBeEach,
	generateEachFixtures,
} from '#src/permutation/primitive/each/each.fixture';

const fixtures = generateEachFixtures(eachInputValues).map(({ name, create }) => ({
	name,
	create,
	expect(v: PermutationGenerator) {
		expectToBeEach(v, []);
	},
}));

for (const e of fixtures) {
	describe(e.name, () => {
		test(`.generatorAt() => each()`, () => e.expect(e.create().generatorAt()));
		test(`.generatorAt('') => each()`, () => e.expect(e.create().generatorAt('')));
		test(`.generatorAt('key') => each()`, () => e.expect(e.create().generatorAt('key')));
	});
}
