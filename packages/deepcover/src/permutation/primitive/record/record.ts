import type { PermutationGenerator } from '#src/permutation/definitions';
import { clean } from '#src/permutation/modifiers/clean';
import { isOptional, optional } from '#src/permutation/modifiers/optional';
import { checkPermutationType } from '#src/permutation/primitive/check-permutation-type';
import { each } from '#src/permutation/primitive/each/each';
import type { RecordArray } from '#src/permutation/primitive/record/record-array.types';
import type { RecordPojo } from '#src/permutation/primitive/record/record-pojo.types';
import type { MyRecord, RecordInput } from '#src/permutation/primitive/record/record.types';
import { series } from '#src/permutation/primitive/series/series';
import { explicitPermutations } from '#src/permutation/pure/explicit-permutations';
import { REMOVE } from '#src/permutation/symbols';
import { allPathLevels, optionalWiseConcat } from '#src/permutation/utils';
import type { Loose } from '#src/utils/common';
import { hasKey } from '#src/utils/entries';
import {
	isExpandableArray,
	isExpandableObject,
	type ExpandableArray,
	type ExpandableObject,
} from '#src/utils/expandable-check';

// TODO: Empty spaces in array/pojo structure should not be included in paths.
//			Also the should be ignored from series

export function record<const T extends ExpandableObject<PermutationGenerator>>(
	input: T,
): RecordPojo<T>;
export function record<const T extends ExpandableArray<PermutationGenerator>>(
	input: T,
): RecordArray<T>;
export function record(input: RecordInput): MyRecord;
export function record(input: RecordInput): MyRecord {
	if (isExpandableArray(input)) return recordArray(input);
	if (isExpandableObject(input)) return recordPojo(input);
	throw new Error('record argument should be array or pojo');
}

export function component<const T extends RecordInput>(input: T): T {
	return input;
}

export function mergeRecord(a: Loose<MyRecord>, b: Loose<MyRecord>): Loose<MyRecord> {
	if (checkPermutationType(a, 'record', 'pojo') && checkPermutationType(b, 'record', 'pojo')) {
		const entries = Object.entries(b.originalInputArg).map(([k, u]) => {
			if (hasKey(a.originalInputArg, k)) return [k, a.originalInputArg[k]!.merge(u)] as const;
			return [k, u] as const;
		});
		const overrode = {
			...a.originalInputArg,
			...Object.fromEntries(entries),
		};
		return isOptional(b) ? optional(record(overrode)) : record(overrode);
	}
	if (checkPermutationType(a, 'record', 'array') && checkPermutationType(b, 'record', 'array')) {
		const maxLength = Math.max(a.originalInputArg.length, b.originalInputArg.length);
		const overrode = Array.from(new Array(maxLength), (_, i) => {
			if (hasKey(a.originalInputArg, i) && hasKey(b.originalInputArg, i))
				return a.originalInputArg[i]!.merge(b.originalInputArg[i]!);
			return (a.originalInputArg[i] ?? b.originalInputArg[i])!;
		});
		return isOptional(b) ? optional(record(overrode)) : record(overrode);
	}
	return b;
}

export function outputMergeRecord(a: Loose<MyRecord>, b: Loose<MyRecord>): PermutationGenerator {
	if (a.subSchemaOf(b)) return b;
	if (checkPermutationType(a, 'record', 'pojo') && checkPermutationType(b, 'record', 'pojo')) {
		const entries = Object.entries(b.originalInputArg).map(([k, u]) => {
			if (hasKey(a.originalInputArg, k))
				return [k, a.originalInputArg[k]!.outputMerge(u)] as const;
			return [k, u] as const;
		});
		const overrode = {
			...a.originalInputArg,
			...Object.fromEntries(entries),
		};
		return optionalWiseConcat(a, b, record(overrode));
	}
	if (checkPermutationType(a, 'record', 'array') && checkPermutationType(b, 'record', 'array')) {
		const maxLength = Math.max(a.originalInputArg.length, b.originalInputArg.length);
		const overrode = Array.from(new Array(maxLength), (_, i) => {
			if (hasKey(a.originalInputArg, i) && hasKey(b.originalInputArg, i))
				return a.originalInputArg[i]!.outputMerge(b.originalInputArg[i]!);
			return (a.originalInputArg[i] ?? b.originalInputArg[i])!;
		});
		return optionalWiseConcat(a, b, record(overrode));
	}
	throw new Error('Illegal state: invalid merge arguments');
}

function recordPojo<const T extends ExpandableObject<PermutationGenerator>>(
	input: T,
): RecordPojo<T> {
	const { r, b } = base(input);
	return Object.assign(Object.create(null), {
		...b,
		*[Symbol.iterator]() {
			const iterableInput = r.map((v) => Iterator.from(v[1]).map((u) => [v[0], u]));
			yield* explicitPermutations(iterableInput)
				.map((v) => v.filter((u) => !!u).filter((u) => u[1] !== REMOVE))
				.map((v) => Object.fromEntries(v));
		},
	});
}

function recordArray<const T extends ExpandableArray<PermutationGenerator>>(
	input: T,
): RecordArray<T> {
	const { r, b } = base(input);
	return Object.assign(Object.create(null), {
		...b,
		*[Symbol.iterator]() {
			yield* explicitPermutations(r.map((v) => v[1])).map((v) => {
				const clone = new Array(v.length);
				v.forEach((u, i) => {
					if (u !== REMOVE) clone[i] = u;
				});
				return clone;
			});
		},
	});
}

function permutationPaths(entries: [string, PermutationGenerator][]) {
	const pathLevels = entries
		.flatMap((v) => {
			const u = v[1].permutationPaths;
			if (u.length === 0) return [v[0]];
			return u.map((w) => `${v[0]}.${w}`);
		})
		.flatMap((v) => allPathLevels(v));
	return [...new Set(pathLevels)];
}

function filterPrimitivePaths(v: PermutationGenerator) {
	return v.permutationPaths.filter((u) => v.generatorAt(u).structure === 'primitive');
}

function hasNoIntersection(v: PermutationGenerator, paths: readonly string[] = []) {
	if (paths.length === 0) return false;
	if (new Set(paths).intersection(new Set(v.permutationPaths)).size === 0) return false;
}

function base<const T extends RecordInput>(input: T) {
	const entries = Object.entries(input);
	const r = entries.map(([k, v]) =>
		isOptional(v) ? ([k, series(clean(v), each(REMOVE))] as const) : ([k, v] as const),
	);
	const size = r.map((v) => v[1].size || 1n).reduce((acc, curr) => acc * curr, 1n);
	const b = {
		get size() {
			return size;
		},
		get modifiers() {
			return [] as const;
		},
		get originalInputArg() {
			return input;
		},
		get type() {
			return 'record' as const;
		},
		get structure() {
			return isExpandableArray(input) ? 'array' : 'pojo';
		},
		get permutationPaths() {
			return permutationPaths(entries);
		},
		get primitivePermutationPaths() {
			return filterPrimitivePaths(this);
		},
		extract(paths = []) {
			if (hasNoIntersection(this, paths))
				return isExpandableArray(input) ? record([]) : record({});
			const extractedInputEntries = entries
				.map(([k, v]) => {
					const filteredPaths = paths.filter((u) => u.startsWith(k));
					if (filteredPaths.length === 0)
						return isExpandableArray(input) ? ([k, each()] as const) : undefined;
					if (filteredPaths.length === 1 && filteredPaths.includes(k))
						return [k, v] as const;
					const shiftPaths = filteredPaths.map((u) => u.replace(`${k}.`, ''));
					return [k, v.extract(shiftPaths)] as const;
				})
				.filter((v) => v !== undefined);
			const extractedInput = isExpandableArray(input)
				? extractedInputEntries.map((v) => v[1])
				: Object.fromEntries(extractedInputEntries);
			return record(extractedInput);
		},
		exclude(paths = []) {
			if (hasNoIntersection(this, paths)) return this;
			const extractedInputEntries = entries
				.map(([k, v]) => {
					const filteredPaths = paths.filter((u) => u.startsWith(k));
					if (filteredPaths.length === 0) return [k, v] as const;
					if (filteredPaths.includes(k))
						return isExpandableArray(input) ? ([k, each()] as const) : undefined;
					const shiftPaths = filteredPaths.map((u) => u.replace(`${k}.`, ''));
					return [k, v.exclude(shiftPaths)] as const;
				})
				.filter((v) => v !== undefined);
			const extractedInput = isExpandableArray(input)
				? extractedInputEntries.map((v) => v[1])
				: Object.fromEntries(extractedInputEntries);
			return record(extractedInput);
		},
		generatorAt(path) {
			if (path === undefined) return each();
			if (!this.permutationPaths.includes(path)) return each();
			const [splitted, ...rest] = path?.split('.') ?? [];
			if (splitted === undefined) return each();
			if (!hasKey(input, splitted)) return each();
			const u = input[splitted] as PermutationGenerator;
			if (rest.length === 0) return u;
			return u.generatorAt(rest.join('.'));
		},
		subSchemaOf(v) {
			if (checkPermutationType(v, 'record')) {
				if (this.structure !== v.structure) return true;
				const isSubsetOfArray = entries.map(
					([k, u]) =>
						hasKey(v.originalInputArg, k) &&
						u.subSchemaOf(v.originalInputArg[k] as PermutationGenerator),
				);
				const isSubsetOf = isSubsetOfArray.every(Boolean);
				if (!isSubsetOf) return false;
				if (isOptional(v)) return isOptional(this);
				return isSubsetOf;
			} else if (checkPermutationType(v, 'series')) {
				const s = series(clean(this));
				if (isOptional(this)) return optional(s).subSchemaOf(v);
				else return s.subSchemaOf(v);
			}
			return true;
		},
		merge(v) {
			if (checkPermutationType(v, 'record')) return mergeRecord(this, v);
			return v;
		},
		outputMerge(v) {
			if (checkPermutationType(v, 'record')) return outputMergeRecord(this, v);
			if (checkPermutationType(v, 'series')) {
				const s = series(clean(this));
				if (isOptional(this)) return optional(s).outputMerge(v);
				return s.outputMerge(v);
			}
			return optionalWiseConcat(this, v);
		},
		union() {
			throw new Error('Not yet implemented');
		},
	} satisfies ThisType<MyRecord> & Omit<MyRecord, typeof Symbol.iterator>;
	return { r, b };
}
