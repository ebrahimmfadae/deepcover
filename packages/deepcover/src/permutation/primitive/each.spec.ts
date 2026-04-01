import type { PermutationGenerator } from '#src/permutation/definitions';
import { each } from '#src/permutation/primitive/each';
import { isNever, never } from '#src/permutation/primitive/never';
import { cachedIterable } from '#src/permutation/pure/cached-iterable';
import { permutations } from '#src/permutation/pure/permutations';

const truthy = [true, 1, 'value', {}, [], Symbol('symbol')] as const;
const falsy = [false, 0, '', undefined, null] as const;
const values = truthy.concat(falsy);
const inputs = cachedIterable(permutations(values, { size: 1 }));

describe('Permutation', () => {
	test(`each()`, () => assertNever(each()));
	for (const e of inputs) {
		const args = serializeArgs(e);
		test(`each(${args})`, () => assertGenerator(each(...e), e));
	}
});

describe('Extract', () => {
	for (const e of inputs) {
		const args = serializeArgs(e);
		test(`each(${args}).extract()`, () => assertNever(each(...e).extract()));
		test(`each(${args}).extract([])`, () => assertNever(each(...e).extract([])));
		test(`each(${args}).extract(['a'])`, () => assertNever(each(...e).extract(['a'])));
	}
});

describe('Exclude', () => {
	for (const e of inputs) {
		const args = serializeArgs(e);
		test(`each(${args}).extract()`, () => assertGenerator(each(...e).exclude(), e));
		test(`each(${args}).extract([])`, () => assertGenerator(each(...e).exclude([]), e));
		test(`each(${args}).extract(['a'])`, () => assertGenerator(each(...e).exclude(['a']), e));
	}
});

describe('GeneratorAt', () => {
	for (const e of inputs) {
		const args = serializeArgs(e);
		test(`each(${args}).generatorAt()`, () => assertNever(each(...e).generatorAt()));
		test(`each(${args}).generatorAt('')`, () => assertNever(each(...e).generatorAt('')));
		test(`each(${args}).generatorAt('a')`, () => assertNever(each(...e).generatorAt('a')));
	}
});

describe('Override', () => {
	for (const e0 of inputs) {
		const args0 = serializeArgs(e0);
		test(`each(${args0}).override(never())`, () => {
			const o = each(...e0).override(never());
			assertNever(o);
		});
		for (const e1 of inputs) {
			const args1 = serializeArgs(e1);
			test(`each(${args0}).override(each(${args1}))`, () => {
				const o = each(e0).override(each(...e1));
				assertGenerator(o, e1);
			});
		}
	}
});

function assertGenerator(v: PermutationGenerator, input: readonly unknown[]) {
	expect(new Set(v)).toStrictEqual(new Set(input));
	expect(v.size).toBe(BigInt(input.length));
	expect(v.permutationPaths).toStrictEqual([]);
	expect(v.primitivePermutationPaths).toStrictEqual([]);
	expect(v.type).toBe('each');
	expect(v.structure).toBe('primitive');
	expect(v.modifiers).toStrictEqual([]);
	expect(v.originalInputArg).toStrictEqual(input);
}

function assertNever(v: PermutationGenerator) {
	expect(isNever(v)).toBe(true);
}

function serializeArgs(e: readonly unknown[]) {
	return e
		.map((v) => {
			if (typeof v === 'symbol') return v.toString();
			if (v instanceof Date) return 'new Date()';
			if (typeof v === 'bigint') return `${v}n`;
			if (v === undefined) return `${v}`;
			return JSON.stringify(v);
		})
		.join(',');
}
