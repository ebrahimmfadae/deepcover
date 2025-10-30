import type { PermutationGenerator } from '#src/permutation/definitions';
import { clean } from '#src/permutation/modifiers/clean';
import { isOptional, optional } from '#src/permutation/modifiers/optional';
import { each } from '#src/permutation/primitive/each';
import type {
	MyRecord,
	RecordPatch,
	SizeAccumulator,
	ValidRecordInput,
} from '#src/permutation/primitive/record.types';
import { series } from '#src/permutation/primitive/series';
import { space } from '#src/permutation/primitive/space';
import { explicitPermutations } from '#src/permutation/pure/explicit-permutations';
import { REMOVE } from '#src/permutation/symbols';
import { allPathLevels, merge } from '#src/permutation/utils';
import { hasKey } from '#src/utils/entries';
import { isExpandableArray } from '#src/utils/expandable-check';

export function mergeRecord(a: MyRecord, b: MyRecord): MyRecord {
	if (isPojoRecord(a) && isPojoRecord(b)) {
		const entries = Object.entries(a.originalInputArg).map(([k, u]) => {
			if (hasKey(b.originalInputArg, k))
				return [k, u.override(b.originalInputArg[k]!)] as const;
			return [k, u] as const;
		});
		const overrode = {
			...b.originalInputArg,
			...Object.fromEntries(entries),
		};
		const res0 = isOptional(a) ? series(record(overrode), clean(b)) : record(overrode);
		const res = isOptional(b) ? optional(res0) : res0;
		return res as MyRecord;
	}
	if (isArrayRecord(a) && isArrayRecord(b)) {
		const maxLength = Math.max(a.originalInputArg.length, b.originalInputArg.length);
		const overrode = Array.from(new Array(maxLength), (_, i) => {
			if (hasKey(a.originalInputArg, i) && hasKey(b.originalInputArg, i))
				return a.originalInputArg[i]!.override(b.originalInputArg[i]!);
			return (a.originalInputArg[i] ?? b.originalInputArg[i])!;
		});
		const res0 = isOptional(a) ? series(record(overrode), clean(b)) : record(overrode);
		const res = isOptional(b) ? optional(res0) : res0;
		return res as MyRecord;
	}
	return b;
}

export function record<const T extends ValidRecordInput>(input: T): MyRecord<T> {
	const r = Object.entries(input).map(([k, v]): [string, PermutationGenerator] =>
		v.modifiers.includes('optional') ? [k, series(clean(v), each(REMOVE))] : [k, v],
	);
	const size = r.map((v) => v[1].size || 1n).reduce((acc, curr) => acc * curr, 1n);
	return Object.assign(
		function* () {
			if (isExpandableArray(input)) {
				yield* explicitPermutations(r.map((v) => v[1]())).map((v) => {
					const clone = new Array(v.length);
					v.forEach((u, i) => {
						if (u !== REMOVE) clone[i] = u;
					});
					return clone;
				});
			} else {
				const iterableInput = r.map((v) => Iterator.from(v[1]()).map((u) => [v[0], u]));
				yield* explicitPermutations(iterableInput)
					.map((v) => v.filter((u) => !!u).filter((u) => u[1] !== REMOVE))
					.map((v) => Object.fromEntries(v));
			}
		},
		{
			get size() {
				return size as SizeAccumulator<T>;
			},
			get modifiers() {
				return [] as readonly never[];
			},
			get originalInputArg() {
				return input;
			},
			get type() {
				return 'record' as const;
			},
			get structure() {
				return (isExpandableArray(input) ? 'array' : 'pojo') as T extends readonly unknown[]
					? 'array'
					: 'pojo';
			},
			get permutationPaths() {
				const entries = Object.entries(input);
				const pathLevels = entries
					.flatMap((v) => {
						const u = v[1].permutationPaths;
						if (u.length === 0) return [v[0]];
						return u.map((w) => `${v[0]}.${w}`);
					})
					.flatMap((v) => allPathLevels(v));
				return [...new Set(pathLevels)] as readonly string[];
			},
			get primitivePermutationPaths() {
				return this.permutationPaths.filter(
					(v) => this.generatorAt(v).structure === 'primitive',
				) as readonly string[];
			},
			extract(paths) {
				const extractedInputEntries = Object.entries(input).map(([k, v]) => {
					const filteredPaths = paths.filter((u) => u.startsWith(k));
					if (filteredPaths.length === 0) return [k, space()];
					if (filteredPaths.length === 1 && filteredPaths.includes(k)) return [k, v];
					const shiftPaths = filteredPaths.map((u) => u.replace(`${k}.`, ''));
					return [k, v.extract(shiftPaths)];
				});
				const extractedInput = isExpandableArray(input)
					? extractedInputEntries.map((v) => v[1])
					: Object.fromEntries(extractedInputEntries);
				return record(extractedInput);
			},
			exclude(paths) {
				const extractedInputEntries = Object.entries(input).map(([k, v]) => {
					const filteredPaths = paths.filter((u) => u.startsWith(k));
					if (filteredPaths.length === 0) return [k, v];
					if (filteredPaths.includes(k)) return [k, space()];
					const shiftPaths = filteredPaths.map((u) => u.replace(`${k}.`, ''));
					return [k, v.exclude(shiftPaths)];
				});
				const extractedInput = isExpandableArray(input)
					? extractedInputEntries.map((v) => v[1])
					: Object.fromEntries(extractedInputEntries);
				return record(extractedInput);
			},
			generatorAt(path) {
				const [splitted, ...rest] = path?.split('.') ?? [];
				if (!path || !hasKey(input, splitted)) return each();
				const v = input[splitted] as PermutationGenerator;
				if (rest.length === 0) return v;
				return v.generatorAt(rest.join('.'));
			},
			override(v) {
				return merge(this, v);
			},
		} satisfies RecordPatch<T> & ThisType<MyRecord<T>>,
	);
}

export function isRecord(v: PermutationGenerator): v is MyRecord {
	return v.type === 'record';
}

export function isPojoRecord(
	v: PermutationGenerator,
): v is MyRecord<Readonly<Record<string, PermutationGenerator>>> {
	if (!isRecord(v)) return false;
	return v.structure === 'pojo';
}

export function isArrayRecord(
	v: PermutationGenerator,
): v is MyRecord<readonly PermutationGenerator[]> {
	if (!isRecord(v)) return false;
	return v.structure === 'array';
}
