import type { PermutationGenerator } from '#src/permutation/definitions';
import { clean, isClean } from '#src/permutation/modifiers/clean';
import { isOptional, optional } from '#src/permutation/modifiers/optional';
import { checkPermutationType } from '#src/permutation/primitive/check-permutation-type';
import { each } from '#src/permutation/primitive/each/each';
import type { Each } from '#src/permutation/primitive/each/each.types';
import { never } from '#src/permutation/primitive/never';
import type { Never } from '#src/permutation/primitive/never.types';
import type {
	Series,
	SeriesMapEach,
	SeriesMapInput,
} from '#src/permutation/primitive/series/series.types';
import { allPathLevels, optionalWiseConcat } from '#src/permutation/utils';
import type { Loose } from '#src/utils/common';

export function series(): Never;
export function series<const T extends readonly Never[]>(...values: T): Never;
export function series<const T extends readonly (Each | Never)[]>(
	...values: T
): Each<SeriesMapEach<SeriesMapInput<T>>>;
export function series<const T extends readonly PermutationGenerator[]>(
	...values: T
): Series<SeriesMapInput<T>>;
export function series(...values: readonly PermutationGenerator[]): Series | Each | Never {
	if (values.some((v) => !isClean(v)))
		throw new Error(`A 'series' can't have components with direct modifiers.`);
	const flatValues = flattenValues(values).filter((v) => !checkPermutationType(v, 'never'));
	if (flatValues.length === 0) return never();
	if (flatValues.every((v) => checkPermutationType(v, 'each')))
		return each(...flatValues.flatMap((v) => v.originalInputArg));
	const structures = new Set(flatValues.map((v) => v.structure));
	const structure = structures.size === 1 ? structures.values().next().value! : 'mixed';
	const size = flatValues.map((v) => v.size).reduce((prev, curr) => prev + curr, 0n);
	return Object.assign(Object.create(null), {
		*[Symbol.iterator]() {
			for (const element of flatValues) yield* element;
		},
		get size() {
			return size;
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
		extract(paths = []) {
			if (paths.length === 0) return each();
			const pathSet = new Set(paths);
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
			const pathSet = new Set(paths);
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
			if (!this.permutationPaths.includes(path)) return each();
			const [splitted, ...rest] = path?.split('.').map((v) => v.replace('#', '')) ?? [];
			if (!path || !splitted || !(splitted in flatValues)) return each();
			const v = flatValues[parseInt(splitted)]!;
			if (rest.length === 0) return v;
			return v.generatorAt(rest.join('.'));
		},
		subSchemaOf(v) {
			if (checkPermutationType(v, 'series')) {
				const isSubset = this.originalInputArg.every((u) =>
					v.originalInputArg.every((w) => u.subSchemaOf(w)),
				);
				if (isOptional(v)) return false;
				return isSubset;
			} else if (checkPermutationType(v, 'never')) return false;
			else if (checkPermutationType(v, 'each')) return false;
			const s = series(clean(v));
			if (isOptional(v)) return this.subSchemaOf(optional(s));
			else return this.subSchemaOf(s);
		},
		merge(v) {
			return v;
		},
		outputMerge(v) {
			if (checkPermutationType(v, 'never')) return v;
			if (checkPermutationType(v, 'each')) return optionalWiseConcat(this, v);
			if (checkPermutationType(v, 'series')) return mergeSeries(this, v);
			const s = series(clean(v));
			if (isOptional(v)) return this.outputMerge(s);
			return this.outputMerge(s);
		},
		union() {
			throw new Error('Not yet implemented');
		},
	} satisfies Series);
}

function subtract(a: Loose<Series>, b: Loose<Series>): Loose<Series> {
	const args = a.originalInputArg.filter((v) =>
		b.originalInputArg.every((u) => v !== u && !v.subSchemaOf(u) && !u.subSchemaOf(v)),
	);
	return isOptional(a) ? optional(series(...args)) : series(...args);
}

export function mergeSeries(a: Loose<Series>, b: Loose<Series>): PermutationGenerator {
	if (a.subSchemaOf(b)) return b;
	const m = a.originalInputArg.flatMap((v) => b.originalInputArg.map((u) => v.outputMerge(u)));
	const uniqueM = new Set(m);
	const s = series(...uniqueM);
	return optionalWiseConcat(subtract(a, s), subtract(b, s), s);
}

function flattenValues(a: readonly PermutationGenerator[]): readonly PermutationGenerator[] {
	return a.flatMap((v) =>
		checkPermutationType(v, 'series') ? flattenValues(v.originalInputArg) : v,
	);
}
