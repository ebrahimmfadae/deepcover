import type { PermutationGenerator } from '#src/permutation/definitions';
import { clean, isClean } from '#src/permutation/modifiers/clean';
import { isOptional, optional } from '#src/permutation/modifiers/optional';
import { each } from '#src/permutation/primitive/each';
import type { Series, SeriesPatch, SeriesSize } from '#src/permutation/primitive/series.types';
import { explicitPermutations } from '#src/permutation/pure/explicit-permutations';
import { allPathLevels, merge } from '#src/permutation/utils';
import { hasKey } from '#src/utils/entries';

function flattenValues(a: readonly PermutationGenerator[]): readonly PermutationGenerator[] {
	return a.flatMap((v) => (isSeries(v) ? flattenValues(v.originalInputArg) : v));
}

export function mergeSeries(a: Series, b: Series): Series {
	const grouped1 = Object.groupBy(a.originalInputArg, (v) => v.structure);
	const grouped2 = Object.groupBy(b.originalInputArg, (v) => v.structure);
	const includesNotMergeable =
		isOptional(a) ||
		a.originalInputArg.some(
			(v) =>
				v.structure === 'primitive' ||
				b.originalInputArg.some((u) => u.structure !== v.structure),
		);
	const rPojo =
		grouped1.pojo && grouped2.pojo
			? explicitPermutations([grouped1.pojo, grouped2.pojo]).map((v) => v[0].override(v[1]))
			: (grouped2.pojo ?? []);
	const rArray =
		grouped1.array && grouped2.array
			? explicitPermutations([grouped1.array, grouped2.array]).map((v) => v[0].override(v[1]))
			: (grouped2.array ?? []);
	const s = series(...rPojo, ...rArray, ...(grouped2.primitive ?? []));
	const res0 = includesNotMergeable ? series(s, clean(b)) : s;
	const res = isOptional(b) ? optional(res0) : res0;
	return res as Series;
}

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
				return [...new Set(pathLevels)];
			},
			get primitivePermutationPaths() {
				return this.permutationPaths.filter(
					(v) => this.generatorAt(v).structure === 'primitive',
				);
			},
			extract(paths) {
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
			exclude(paths) {
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
