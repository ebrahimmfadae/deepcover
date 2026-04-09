import type { PermutationGenerator } from '#src/permutation/definitions';
import { generateRecordFixtures } from '#src/permutation/primitive/record/record.fixture';

const fixtures = generateRecordFixtures(undefined, 2).map((v) => ({
	...v,
	expect(p: PermutationGenerator) {
		expect(p.size).toBe(BigInt(v.output.length));
		expect(new Set(p)).toStrictEqual(new Set(v.output as unknown[]));
		expect(p.type).toBe('record');
		expect(p.structure).toBe(v.structure);
		expect(p.originalInputArg).toStrictEqual(v.input);
		expect(p.modifiers).toStrictEqual(v.shouldBeOptional ? ['optional'] : []);
		expect(p.permutationPaths).containSubset(v.paths);
		expect(v.paths).containSubset(p.permutationPaths);
		expect(p.primitivePermutationPaths).containSubset(v.primitivePaths);
		expect(v.primitivePaths).containSubset(p.primitivePermutationPaths);
	},
}));

for (const element0 of fixtures) test(element0.name, () => element0.expect(element0.create()));
