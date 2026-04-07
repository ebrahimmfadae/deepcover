import { eachFixtures, expectEach } from '#src/permutation/primitive/each/each.fixture';

for (const e of eachFixtures) {
	describe(e.name, () => {
		test(`.generatorAt()`, () => expectEach(e.generator.generatorAt()));
		test(`.generatorAt([])`, () => expectEach(e.generator.generatorAt()));
		test(`.generatorAt(['key'])`, () => expectEach(e.generator.generatorAt('key')));
	});
}
