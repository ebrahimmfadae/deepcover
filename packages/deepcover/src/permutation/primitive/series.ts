import type { PermutationGenerator } from '#src/permutation/definitions';
import { isClean } from '#src/permutation/modifiers/clean';
import { isOptional, optional } from '#src/permutation/modifiers/optional';
import { each } from '#src/permutation/primitive/each';
import type {
	Series,
	SeriesPatch,
	SeriesPermutationPaths,
	SeriesSize,
} from '#src/permutation/primitive/series.types';
import { explicitPermutations } from '#src/permutation/pure/explicit-permutations';
import { allPathLevels, merge } from '#src/permutation/utils';
import { hasKey } from '#src/utils/entries';

// TODO: Empty permutations (e.g. each()) are not handled
export function series<const T extends readonly PermutationGenerator[]>(...values: T): Series<T> {
	if (values.some((v) => !isClean(v)))
		throw new Error(`A 'series' can't have components with direct modifiers.`);
	const flatValues = flattenValues(values);
	const structures = new Set(flatValues.map((v) => v.structure));
	const structure = structures.size === 1 ? structures.values().next().value! : 'mixed';
	const size = flatValues.map((v) => v.size).reduce((prev, curr) => prev + curr, 0n);
	return Object.assign(
		function* () {
			for (const element of flatValues) yield* element();
		},
		{
			get size() {
				return size as SeriesSize<T>;
			},
			get modifiers() {
				return [] as readonly never[];
			},
			get originalInputArg() {
				return flatValues;
			},
			get type() {
				return 'series' as const;
			},
			get structure() {
				return structure;
			},
			get permutationPaths() {
				const entries = Object.entries(flatValues);
				const pathLevels = entries
					.flatMap((v) => {
						const u = v[1].permutationPaths;
						if (u.length === 0) return [`#${v[0]}`];
						return u.map((w) => `#${v[0]}.${w}`);
					})
					.flatMap((v) => allPathLevels(v));
				return [...new Set(pathLevels)] as SeriesPermutationPaths<T>[];
			},
			get primitivePermutationPaths() {
				return this.permutationPaths.filter(
					(v) => this.generatorAt(v).structure === 'primitive',
				);
			},
			extract(paths = []) {
				if (paths.length === 0) return each();
				const pathSet = new Set(paths as readonly SeriesPermutationPaths<T>[]);
				if (pathSet.intersection(new Set(this.permutationPaths)).size === 0) return each();
				const extractedValues = Object.entries(flatValues).map(([k, v]) => {
					const k2 = `#${k}`;
					const filteredPaths = paths.filter((u) => u.startsWith(k2));
					if (filteredPaths.length === 0) return each();
					if (filteredPaths.length === 1 && filteredPaths.includes(k2)) return v;
					const shiftPaths = filteredPaths.map((u) => u.replace(`${k2}.`, ''));
					return v.extract(shiftPaths);
				});
				return series(...extractedValues);
			},
			exclude(paths = []) {
				if (paths.length === 0) return this;
				const pathSet = new Set(paths as readonly SeriesPermutationPaths<T>[]);
				if (pathSet.intersection(new Set(this.permutationPaths)).size === 0) return this;
				const extractedValues = Object.entries(flatValues).map(([k, v]) => {
					const k2 = `#${k}`;
					const filteredPaths = paths.filter((u) => u.startsWith(k2));
					if (filteredPaths.length === 0) return v;
					if (filteredPaths.includes(k2)) return each();
					const shiftPaths = filteredPaths.map((u) => u.replace(`${k2}.`, ''));
					return v.extract(shiftPaths);
				});
				return series(...extractedValues);
			},
			generatorAt(path) {
				if (path === undefined) return each();
				if (!this.permutationPaths.includes(path as SeriesPermutationPaths<T>))
					return each();
				const [splitted, ...rest] = path?.split('.').map((v) => v.replace('#', '')) ?? [];
				if (!path || !hasKey(flatValues, splitted)) return each();
				const v = flatValues[splitted] as PermutationGenerator;
				if (rest.length === 0) return v;
				return v.generatorAt(rest.join('.'));
			},
			override(v) {
				return merge(this, v);
			},
		} satisfies SeriesPatch<T> & ThisType<Series<T>>,
	) as Series<T>;
}

export function isSeries(v: PermutationGenerator): v is Series {
	return v.type === 'series';
}

// TODO: Permutation Generators with modifiers (e.g. optional) are not assignable to raw type. it should be fixed

/**
 * 1. All primitives in `a` should be overridden by `b` completely
 * 2. All expandable-s in `a` should be merged with `b` of the same structure
 * 3. Standalone expandable-s should be included separately
 *
 * NOTE: A `series` will never have a direct `mixed` item
 */
// TODO: There is a serious issue with nested permutation merging, there will be duplication if nested object is also going to be merged
export function mergeSeries(a: Series, b: Series): Series {
	const aStructures = a.originalInputArg.map((v) => v.structure);
	if (aStructures.every((v) => v === 'primitive')) return b;
	const bStructures = b.originalInputArg.map((v) => v.structure);
	if (bStructures.every((v) => v === 'primitive')) return b;
	const grouped1 = Object.groupBy(a.originalInputArg, (v) => v.structure);
	const grouped2 = Object.groupBy(b.originalInputArg, (v) => v.structure);
	const pojos =
		grouped1.pojo && grouped2.pojo
			? getCombined(explicitPermutations([grouped1.pojo, grouped2.pojo])).toArray()
			: [];
	const arrays =
		grouped1.array && grouped2.array
			? getCombined(explicitPermutations([grouped1.array, grouped2.array])).toArray()
			: [];
	const aHasPrimitive = isOptional(a) || aStructures.some((v) => v === 'primitive');
	const aHasArray = !!grouped1.array?.length;
	const aHasPojo = !!grouped1.pojo?.length;
	const replaceArrays =
		aHasPrimitive || aHasPojo ? getReplaced(grouped1.array, grouped2.array) : [];
	const replacePojos =
		aHasPrimitive || aHasArray ? getReplaced(grouped1.pojo, grouped2.pojo) : [];
	const prefix = [replaceArrays, replacePojos];
	const s = series(...prefix.flat(), ...pojos, ...arrays, ...(grouped2.primitive ?? []));
	const res = isOptional(b) ? optional(s) : s;
	return res as Series;
}

function flattenValues(a: readonly PermutationGenerator[]): readonly PermutationGenerator[] {
	return a.flatMap((v) => (isSeries(v) ? flattenValues(v.originalInputArg) : v));
}

function aIsSubsetOfB(a: PermutationGenerator, b: PermutationGenerator): boolean {
	const regex = /\.?#\d+/g;
	const a0 = new Set(a.primitivePermutationPaths.map((u) => u.replace(regex, '')));
	const b0 = new Set(b.primitivePermutationPaths.map((u) => u.replace(regex, '')));
	return a0.isSubsetOf(b0);
}

function getCombined(
	a: IteratorObject<readonly [PermutationGenerator, PermutationGenerator]>,
): IteratorObject<PermutationGenerator> {
	return a.filter((v) => !aIsSubsetOfB(v[0], v[1])).map((v) => v[0].override(v[1]));
}

function getReplaced(
	a?: readonly PermutationGenerator[],
	b?: readonly PermutationGenerator[],
): readonly PermutationGenerator[] {
	if (a && b) return b.filter((v) => a.every((u) => aIsSubsetOfB(u, v)));
	if (!a && b) return b;
	return [];
}
