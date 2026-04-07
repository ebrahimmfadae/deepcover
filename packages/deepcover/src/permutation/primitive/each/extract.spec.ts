import { eachFixtures, expectEach } from '#src/permutation/primitive/each/each.fixture';

for (const e of eachFixtures) {
	describe(e.name, () => {
		test(`.extract()`, () => expectEach(e.generator.extract()));
		test(`.extract([])`, () => expectEach(e.generator.extract([])));
		test(`.extract(['key'])`, () => expectEach(e.generator.extract(['a'])));
	});
}
