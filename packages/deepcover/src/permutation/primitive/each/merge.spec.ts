import { eachFixtures, expectEach } from '#src/permutation/primitive/each/each.fixture';

for (const e0 of eachFixtures) {
	describe(e0.name, () => {
		for (const e1 of eachFixtures) {
			test(`.merge(${e1.name})`, () => {
				const o = e0.generator.merge(e1.generator);
				expectEach(o, e1.input);
			});
		}
	});
}
