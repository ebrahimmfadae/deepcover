import { optional } from '#src/permutation/modifiers/optional';
import { each } from '#src/permutation/primitive/each/each';
import { eachFixtures, expectEach } from '#src/permutation/primitive/each/each.fixture';

for (const e0 of eachFixtures) {
	// 	describe(e0.name, () => {
	// 		for (const e1 of eachFixtures) {
	// 			test(`.outputMerge(${e1.name})`, () => {
	// 				const o = e0.generator.outputMerge(e1.generator);
	// 				expectEach(o, e1.input.length ? e1.input : e0.input);
	// 			});
	// 		}
	// 	});
}

// describe('each()', () => {
// 	test(`.outputMerge(optional(each(1)))`, () => {
// 		const o = each().outputMerge(optional(each(1)));
// 		expectEach(o, [1], true);
// 	});
// });

// describe('each(1)', () => {
// 	test(`.outputMerge(optional(each(2)))`, () => {
// 		const o = each(1).outputMerge(optional(each(2)));
// 		expect(o.type).toBe('series');
// 		expect(Iterator.from(o).toArray()).toStrictEqual([1, 2]);
// 		expect(o.modifiers).lengthOf(0);
// 		expect(o.permutationPaths).toStrictEqual(['#0', '#1']);
// 		expect(o.primitivePermutationPaths).toStrictEqual(['#0', '#1']);
// 	});
// });

// describe('optional(each(1))', () => {
// 	test(`.outputMerge(optional(each(2)))`, () => {
// 		const o = optional(each(1)).outputMerge(optional(each(2)));
// 		expect(o.type).toBe('series');
// 		expect(Iterator.from(o).toArray()).toStrictEqual([1, 2]);
// 		expect(o.modifiers).includes('optional');
// 		expect(o.permutationPaths).toStrictEqual(['#0', '#1']);
// 		expect(o.primitivePermutationPaths).toStrictEqual(['#0', '#1']);
// 	});
// });

// describe('optional(each(1))', () => {
// 	test(`.outputMerge(each(2))`, () => {
// 		const o = optional(each(1)).outputMerge(each(2));
// 		expectEach(o, [2]);
// 	});
// });

// describe('optional(each(1))', () => {
// 	test(`.outputMerge(each())`, () => {
// 		const o = optional(each(1)).outputMerge(each());
// 		expectEach(o, [1], true);
// 	});
// });

describe('a', () => {
	test(`b`, () => {
		const o = optional(each(1, 2, 3)).outputMerge(optional(each(2, 3, 5)));
		for (const element of o) {
			console.log(element);
		}
	});
});
