import { optional } from '#src/permutation/modifiers/optional';
import { each } from '#src/permutation/primitive/each/each';
import { record } from '#src/permutation/primitive/record/record';

// describe('a', () => {
// 	test('b', () => {
// 		const a = record({ a: optional(record({ b: each(1) })) });
// 		const b = record({ a: record({ b: each(1, 2) }) });
// 		console.log(a.subSchemaOf(b));
// 		// for (const element of a.outputMerge(b)) {
// 		// 	console.log(element);
// 		// }
// 	});
// });

// describe('a', () => {
// 	test('b', () => {
// 		const a = record({ a: optional(record({ b: each(1) })) });
// 		const b = record({ a: record({}) });
// 		console.log(a.subSchemaOf(b));
// 	});
// });

// describe('a', () => {
// 	test('b', () => {
// 		const a = optional(record({ b: each(1) }));
// 		const b = record({});
// 		console.log(b.subSchemaOf(a));
// 	});
// });

// describe('a', () => {
// 	test('b', () => {
// 		const a = record({ a: optional(record({ b: each(1, 2, 3) })) });
// 		const b = record({ a: record({}), c: each(8, 9) });
// 		for (const element of a.outputMerge(b)) {
// 			console.log(element);
// 		}
// 	});
// });

// describe('a', () => {
// 	test('b', () => {
// 		const a = record([optional(record({ b: each(1, 2, 3) }))]);
// 		const b = optional(record([record({}), each(8, 9)]));
// 		for (const element of a.outputMerge(b)) {
// 			console.log(element);
// 		}
// 	});
// });

// describe('a', () => {
// 	test('b', () => {
// 		const a = record([optional(record({ b: each(1, 2, 3) }))]);
// 		const b = optional(each('wwe'));
// 		for (const element of a.outputMerge(b)) {
// 			console.log(element);
// 		}
// 	});
// });

describe('a', () => {
	test('b', () => {
		const a = each(88);
		const b = optional(record([optional(record({})), optional(each(8, 9))]));
		for (const element of a.outputMerge(b)) {
			console.log(element);
		}
	});
});

// describe('a', () => {
// 	test('b', () => {
// 		const a = record([
// 			optional(record({ b: each(1, 2, 3), d: record([optional(record({ b: each(1) }))]) })),
// 		]);
// 		const b = optional(record([record({}), each(8, 9)]));
// 		for (const element of a.outputMerge(b)) {
// 			console.log(element);
// 		}
// 	});
// });
