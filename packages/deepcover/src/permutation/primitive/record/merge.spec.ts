import { optional } from '#src/permutation/exports';
import { each } from '#src/permutation/primitive/each/each';
import { record } from '#src/permutation/primitive/record/record';

// test('merge two distinct pojo records', () => {
// 	const a = record({ a: each(1, 2) });
// 	const b = record({ b: each(3, 4) });
// 	const m = a.merge(b);
// 	for (const element of m) {
// 		console.log(element);
// 	}
// });

// test('merge two distinct nested pojo records with similar root path', () => {
// 	const a = record({ a: record({ b: each(1, 2) }) });
// 	const b = record({ a: record({ c: each(3, 4) }) });
// 	const m = a.merge(b);
// 	for (const element of m) {
// 		console.log(element);
// 	}
// });

// test('merge two distinct nested pojo records with similar root path and optionality in source path', () => {
// 	const a = record({ a: optional(record({ b: each(1, 2) })) });
// 	const b = record({ a: record({ c: each(3, 4) }) });
// 	const m = a.merge(b);
// 	for (const element of m) {
// 		console.log(element);
// 	}
// });

// test('merge two distinct nested pojo records with similar root path and optionality in target path', () => {
// 	const a = record({ a: record({ b: each(1, 2) }) });
// 	const b = record({ a: optional(record({ c: each(3, 4) })) });
// 	const m = a.merge(b);
// 	for (const element of m) {
// 		console.log(element);
// 	}
// });

// test('merge two similar pojo records', () => {
// 	const a = record({ a: each(1, 2) });
// 	const b = record({ a: each(3, 4) });
// 	const m = a.merge(b);
// 	for (const element of m) {
// 		console.log(element);
// 	}
// });

// test('merge two intersected pojo records', () => {
// 	const a = record({ a: each(1, 2), b: each(3, 4) });
// 	const b = record({ a: each(5, 6), c: each(7, 8) });
// 	const m = a.merge(b);
// 	for (const element of m) {
// 		console.log(element);
// 	}
// });

// test('merge two similar nested array records with similar root path', () => {
// 	const a = record([record({ b: each(1, 2) })]);
// 	const b = record([record({ c: each(3, 4) })]);
// 	const m = a.merge(b);
// 	for (const element of m) {
// 		console.log(element);
// 	}
// });

// test('merge two similar nested array records with similar root path and optionality in source path', () => {
// 	const a = record([optional(record({ b: each(1, 2) }))]);
// 	const b = record([record({ c: each(3, 4) })]);
// 	const m = a.merge(b);
// 	for (const element of m) {
// 		console.log(element);
// 	}
// });

// test('merge two similar nested array records with similar root path (reversed)', () => {
// 	const a = record([record({ c: each(3, 4) })]);
// 	const b = record([record({ b: each(1, 2) })]);
// 	const m = a.merge(b);
// 	for (const element of m) {
// 		console.log(element);
// 	}
// });

// test('merge two similar nested array records with similar root path and optionality in source path (reversed)', () => {
// 	const a = record([record({ c: each(3, 4) })]);
// 	const b = record([optional(record({ b: each(1, 2) }))]);
// 	const m = a.merge(b);
// 	for (const element of m) {
// 		console.log(element);
// 	}
// });

// test('merge two distinct nested array records with similar root path', () => {
// 	const a = record([record({ b: each(1, 2) })]);
// 	const b = record([record({ c: each(3, 4) }), each()]);
// 	const m = a.merge(b);
// 	for (const element of m) {
// 		console.log(element);
// 	}
// });

// test('merge two distinct nested array records with similar root path and optionality in source path', () => {
// 	const a = record([optional(record({ b: each(1, 2) }))]);
// 	const b = record([record({ c: each(3, 4) }), each()]);
// 	const m = a.merge(b);
// 	for (const element of m) {
// 		console.log(element);
// 	}
// });

// test('merge two distinct nested array records with similar root path (reversed)', () => {
// 	const a = record([record({ c: each(3, 4) }), each()]);
// 	const b = record([record({ b: each(1, 2) })]);
// 	const m = a.merge(b);
// 	for (const element of m) {
// 		console.log(element);
// 	}
// });

// test('merge two distinct nested array records with similar root path and optionality in source path (reversed)', () => {
// 	const a = record([record({ c: each(3, 4) }), each()]);
// 	const b = record([optional(record({ b: each(1, 2) }))]);
// 	const m = a.merge(b);
// 	for (const element of m) {
// 		console.log(element);
// 	}
// });

test('merge special case of array record', () => {
	const a = record([record({ c: each(3, 4) }), each(2)]);
	const b = record([optional(record({ b: each(1, 2) }))]);
	const m = a.merge(b);
	for (const element of m) {
		console.log(element);
	}
});

test('merge special case of array record (reversed)', () => {
	const a = record([optional(record({ b: each(1, 2) }))]);
	const b = record([record({ c: each(3, 4) }), each(2)]);
	const m = a.merge(b);
	for (const element of m) {
		console.log(element);
	}
});

// test('merge two distinct nested pojo records with similar root path and optionality in target path', () => {
// 	const a = record({ a: record({ b: each(1, 2) }) });
// 	const b = record({ a: optional(record({ c: each(3, 4) })) });
// 	const m = a.merge(b);
// 	for (const element of m) {
// 		console.log(element);
// 	}
// });

// test('merge two intersected array records', () => {
// 	const a = record([each(1, 2)]);
// 	const b = record([each(), each(5, 6)]);
// 	const m = a.merge(b);
// 	for (const element of m) {
// 		console.log(element);
// 	}
// });

// test('merge two intersected array records (reversed)', () => {
// 	const a = record([each(), each(5, 6)]);
// 	const b = record([each(1, 2)]);
// 	const m = a.merge(b);
// 	for (const element of m) {
// 		console.log(element);
// 	}
// });

// test('merge two similar array records', () => {
// 	const a = record([each(1, 2)]);
// 	const b = record([each(3, 4)]);
// 	const m = a.merge(b);
// 	for (const element of m) {
// 		console.log(element);
// 	}
// });

// test('merge an empty array records', () => {
// 	const a = record([]);
// 	const b = record([each(5, 6)]);
// 	const m = a.merge(b);
// 	for (const element of m) {
// 		console.log(element);
// 	}
// });

// test('merge an empty array records (reversed)', () => {
// 	const a = record([each(5, 6)]);
// 	const b = record([]);
// 	const m = a.merge(b);
// 	for (const element of m) {
// 		console.log(element);
// 	}
// });
