import { each, record } from '#src/permutation/exports';
import { escapePropertyKey, type Base } from '#src/permutation/primitive/common.fixture';
import { eachFixtures } from '#src/permutation/primitive/each/each.fixture';
import { cachedIterable } from '#src/permutation/pure/cached-iterable';
import { concat } from '#src/permutation/pure/concat';
import { explicitPermutations } from '#src/permutation/pure/explicit-permutations';
import { permutations } from '#src/permutation/pure/permutations';
import { reiterate } from '#src/permutation/pure/reiterable';
import { isExpandableArray, isExpandableObject } from '#src/utils/expandable-check';

export function generateRecordFixtures(b: Iterable<Base> = eachFixtures, level = 0) {
	const r = getRecords(b);
	if (level === 0) return r;
	return generateRecordFixtures(cachedIterable(concat(b, r)), level - 1);
}

export function expectRecord(
	base: Base<Readonly<Record<PropertyKey, unknown>> | readonly unknown[]>,
) {
	const stringifiedOutput = base.output
		.map((v) => Object.fromEntries(Object.entries(v).sort((a, b) => (b[0] < a[0] ? 1 : -1))))
		.map((v) => JSON.stringify(v));
	const calculatedStringifiedOutput = new Set(
		Iterator.from(base.generator)
			.map((v) =>
				Object.fromEntries(
					Object.entries(v as object).sort((a, b) =>
						b[0] === a[0] ? 0 : b[0] < a[0] ? 1 : -1,
					),
				),
			)
			.map((v) => JSON.stringify(v)),
	);
	const v = base.generator;
	expect(calculatedStringifiedOutput).toStrictEqual(new Set(stringifiedOutput));
	expect(v.size).toBe(BigInt(base.output.length));
	expect(v.permutationPaths.toSorted()).toStrictEqual(base.paths.toSorted());
	expect(v.primitivePermutationPaths.toSorted()).toStrictEqual(base.primitivePaths.toSorted());
	expect(v.type).toBe('record');
	expect(v.structure).toBeOneOf(['array', 'pojo']);
	if (isExpandableArray(base.input)) expect(v.structure).toBe('array');
	else if (isExpandableObject(base.input)) expect(v.structure).toBe('pojo');
	expect(v.modifiers).toStrictEqual([]);
	expect(v.originalInputArg).toStrictEqual(base.input);
}

function getRecords<T extends Iterable<Base>>(base: T) {
	const perm = cachedIterable(
		concat(permutations(base, { size: 0 }), permutations(base, { size: 1 })),
	);
	return concat(
		Iterator.from(perm).map((v) => {
			const buildKey = (i: number) => `key${i}`;
			const entries = v.map((v, i) => [buildKey(i), v.generator] as const);
			const schema = Object.fromEntries(entries);
			const name = `record({${v.map((u, i) => `${escapePropertyKey(buildKey(i))}:${u.name}`)}})`;
			const generator = record(schema);
			const output = explicitPermutations(
				v.map((u, i) => u.output.map((w) => [buildKey(i), w] as const)),
			)
				.map((u) => u.filter((w) => w !== undefined))
				.map((u) => Object.fromEntries(u))
				.toArray();
			const paths = getPaths(v, buildKey);
			const primitivePaths = getPrimitivePaths(v, buildKey);
			return {
				name,
				input: schema,
				primitive: false,
				paths,
				primitivePaths,
				output,
				generator,
			} satisfies Base;
		}),
		Iterator.from(perm).map((v) => {
			const buildKey = (i: number) => `${i}`;
			const schema = v.map((u) => u.generator);
			const name = `record([${v.map((u) => u.name)}])`;
			const generator = record(schema);
			const output = explicitPermutations(v.map((u) => u.output)).toArray();
			const paths = getPaths(v, buildKey);
			const primitivePaths = getPrimitivePaths(v, buildKey);
			return {
				name,
				input: schema,
				primitive: false,
				paths,
				primitivePaths,
				output,
				generator,
			} satisfies Base;
		}),
	);
}

function getPaths(base: readonly Base[], buildKey: (i: number) => string) {
	return base.flatMap((v, i) => {
		const k = buildKey(i);
		return v.paths.length ? [k, ...v.paths.map((z) => `${k}.${z}`)] : [k];
	});
}

function getPrimitivePaths(base: readonly Base[], buildKey: (i: number) => string) {
	return base.flatMap((v, i) => {
		const k = buildKey(i);
		return v.primitivePaths.length
			? v.primitivePaths.map((w) => `${k}.${w}`)
			: v.primitive
				? [k]
				: [];
	});
}
