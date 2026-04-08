import { generateEachFixtures } from '#src/permutation/primitive/each/each.fixture';

function fixtures() {
	return generateEachFixtures([1, 2]).map((a) => ({
		name: a.name,
		e: generateEachFixtures([1, 2, 3, 4]).map((b) => {
			const result = a.input.length === 0 || (b.input.length > 0 && !b.shouldBeOptional);
			return {
				name: b.name,
				result: `${result}`,
				create() {
					return a.create().subSchemaOf(b.create());
				},
				expect(v: boolean) {
					expect(v).toBe(result);
				},
			};
		}),
	}));
}

for (const { name, e } of fixtures()) {
	describe(name, () => {
		for (const e1 of e)
			test(`.subSchemaOf(${e1.name}) => ${e1.result}`, () => e1.expect(e1.create()));
	});
}
