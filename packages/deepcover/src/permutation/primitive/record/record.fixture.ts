import type { PermutationGenerator, Structure } from '#src/permutation/definitions';
import { optional } from '#src/permutation/modifiers/optional';
import { escapePropertyKey } from '#src/permutation/primitive/common.fixture';
import { generateEachFixtures } from '#src/permutation/primitive/each/each.fixture';
import { record } from '#src/permutation/primitive/record/record';
import { cachedIterable } from '#src/permutation/pure/cached-iterable';
import { combinations } from '#src/permutation/pure/combinations';
import { concat } from '#src/permutation/pure/concat';
import { explicitPermutations } from '#src/permutation/pure/explicit-permutations';
import { permutations } from '#src/permutation/pure/permutations';
import type { IterableElement } from 'type-fest';

export function generateRecordFixtures(
	b: Iterable<Base> = cachedIterable(adaptEach(generateEachFixtures([1, 2]))),
	level = 0,
) {
	const r = getRecords(b);
	if (level === 0) return r;
	return generateRecordFixtures(concat(b, r), level - 1);
}

export function adaptEach<
	T extends {
		readonly name: string;
		readonly input: readonly unknown[];
		readonly shouldBeOptional: boolean;
		readonly structure: Structure;
		readonly create: () => PermutationGenerator;
	},
>(v: Iterable<T>) {
	return Iterator.from(v).map(({ input, ...rest }) => ({
		input,
		output: input,
		paths: [] as const,
		primitivePaths: [] as const,
		...rest,
	}));
}

function* getRecords<T extends Iterable<Base>>(base: T) {
	const perm = cachedIterable(
		explicitPermutations([
			[{ shouldBeOptional: false }, { shouldBeOptional: true }],
			concat(
				permutations(base, { size: 0 }),
				permutations(base, { size: 1 }),
				permutations(base, { size: 2 }),
			),
		]),
	);
	// POJO
	for (const [{ shouldBeOptional }, v] of perm) {
		const buildKey = (i: number) => `key${i}`;
		const nameRaw = `record({${v.map((u, i) => `${escapePropertyKey(buildKey(i))}:${u.name}`)}})`;
		const name = shouldBeOptional ? `optional(${nameRaw})` : nameRaw;
		const output = getOutputs(v, buildKey);
		const entries = v.map((u, i) => [buildKey(i), u.create()] as const);
		const schema = Object.fromEntries(entries);
		const paths = getPaths(v, buildKey);
		const primitivePaths = getPrimitivePaths(v, buildKey);
		yield {
			name,
			input: schema,
			output,
			paths,
			primitivePaths,
			shouldBeOptional,
			structure: 'pojo' as const,
			create() {
				return shouldBeOptional ? optional(record(schema)) : record(schema);
			},
		};
	}
	// ARRAY
	for (const [{ shouldBeOptional }, v] of perm) {
		const buildKey = (i: number) => `${i}`;
		const nameRaw = `record([${v.map((u) => u.name)}])`;
		const name = shouldBeOptional ? `optional(${nameRaw})` : nameRaw;
		const schema = v.map((u) => u.create());
		const output = getOutputs(v, buildKey).map((u) => {
			type Element = IterableElement<T>['output'][number];
			const aa = new Array<Element>(v.length);
			for (let i = 0; i < aa.length; i++) if (`${i}` in u) aa[i] = u[`${i}`];
			return aa;
		});
		const paths = getPaths(v, buildKey);
		const primitivePaths = getPrimitivePaths(v, buildKey);
		yield {
			name,
			input: schema,
			output,
			paths,
			primitivePaths,
			shouldBeOptional,
			structure: 'array' as const,
			create() {
				return shouldBeOptional ? optional(record(schema)) : record(schema);
			},
		};
	}
}

function getOutputs<T extends readonly Base[]>(v: T, buildKey: (i: number) => string) {
	const vv = v.map((u, i) => [buildKey(i), u] as const).filter((u) => u[1].output.length > 0);
	if (vv.length === 0) return [{}];
	const requiredFields = vv.filter((u) => !u[1].shouldBeOptional);
	const optionalFields = vv.filter((u) => u[1].shouldBeOptional);
	if (requiredFields.length === 0 && optionalFields.length === 0) return [{}];
	const optionalFieldsSet = combinations(optionalFields, { min: 0 });
	const mergedFields = optionalFieldsSet.map((u) => [...requiredFields, ...u]);
	const input = mergedFields.map((u) =>
		u.map((w) => explicitPermutations([[w[0]], w[1].output])),
	);
	return input
		.map((u) => explicitPermutations(u))
		.flatMap((u) => u.map((w) => Object.fromEntries(w)))
		.toArray();
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
			: v.structure === 'primitive'
				? [k]
				: [];
	});
}

type Base = {
	readonly name: string;
	readonly input: unknown;
	readonly output: readonly unknown[];
	readonly paths: readonly string[];
	readonly primitivePaths: readonly string[];
	readonly shouldBeOptional: boolean;
	readonly structure: Structure;
	readonly create: () => PermutationGenerator;
};

// TODO: Add description about loop breaking to README.md
// If two files have circular imports they should be resolved or intentionally escaped.
// If in a large data set, some testcases will break the loop, it is not required to run them separately
