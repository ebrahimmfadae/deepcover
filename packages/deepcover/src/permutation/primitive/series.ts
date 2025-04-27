import type {
	PermutationGenerator,
	Structure,
	UnwrapPermutation,
	UnwrapPermutationGenerator,
} from '#src/permutation/definitions';
import { isOptional, optional } from '#src/permutation/exports';
import { clean, isClean } from '#src/permutation/modifiers/clean';
import { each } from '#src/permutation/primitive/each';
import { explicitPermutations } from '#src/permutation/pure/explicit-permutations';
import { allPathLevels, merge } from '#src/permutation/utils';
import { hasKey } from '#src/utils/entries';

function flattenValues(a: readonly PermutationGenerator[]): readonly PermutationGenerator[] {
	return a.flatMap((v) => (isSeries(v) ? flattenValues(v.originalInputArg) : v));
}

export type SeriesContext = {
	readonly removeKeys?: readonly string[];
};

export type SeriesIterable<T extends readonly PermutationGenerator[]> =
	Iterable<UnwrapPermutation<UnwrapPermutationGenerator<T[number]>>> extends infer P ? P : never;

export type SeriesGenerator<
	T extends readonly PermutationGenerator[] = readonly PermutationGenerator[],
> = () => SeriesIterable<T>;

export type SeriesPatch = {
	readonly size: number;
	readonly modifiers: [];
	readonly originalInputArg: readonly PermutationGenerator[];
	readonly type: 'series';
	readonly structure: Structure;
	readonly permutationPaths: string[];
	readonly primitivePermutationPaths: string[];
	extract: (paths: readonly string[]) => PermutationGenerator;
	exclude: (paths: readonly string[]) => PermutationGenerator;
	generatorAt: (path: string) => PermutationGenerator;
	override: (v: PermutationGenerator) => PermutationGenerator;
};

export function mergeSeries(
	a: SeriesGenerator & SeriesPatch,
	b: SeriesGenerator & SeriesPatch,
): SeriesGenerator & SeriesPatch {
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
	return res as SeriesGenerator & SeriesPatch;
}

export function series<const T extends readonly PermutationGenerator[]>(
	...values: T
): SeriesGenerator<T> & SeriesPatch {
	if (values.some((v) => !isClean(v)))
		throw new Error(`A 'series' can't have components with direct modifiers.`);
	const flatValues = flattenValues(values);
	const structures = new Set(flatValues.map((v) => v.structure));
	const structure = structures.size === 1 ? structures.values().next().value! : 'mixed';
	const size = flatValues.map((v) => v.size).reduce((prev, curr) => prev + curr, 0);
	return Object.assign(
		function* () {
			for (const element of flatValues) yield* element();
		} as SeriesGenerator<T>,
		{
			get size() {
				return size;
			},
			get modifiers() {
				return [] as [];
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
		} satisfies SeriesPatch & ThisType<SeriesGenerator<T> & SeriesPatch>,
	) as SeriesGenerator<T> & SeriesPatch;
}

export function isSeries(v: PermutationGenerator): v is SeriesGenerator & SeriesPatch {
	return v.type === 'series';
}
