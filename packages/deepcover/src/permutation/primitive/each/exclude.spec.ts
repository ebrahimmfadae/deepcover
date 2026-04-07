import { eachFixtures, expectEach } from '#src/permutation/primitive/each/each.fixture';

for (const e of eachFixtures) {
	describe(e.name, () => {
		test(`.exclude()`, () => expectEach(e.generator.exclude(), e.input));
		test(`.exclude([])`, () => expectEach(e.generator.exclude([]), e.input));
		test(`.exclude(['key'])`, () => expectEach(e.generator.exclude(['a']), e.input));
	});
}
