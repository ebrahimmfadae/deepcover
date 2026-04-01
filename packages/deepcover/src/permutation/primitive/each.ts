import type { PermutationGenerator } from '#src/permutation/definitions';
import type { Each } from '#src/permutation/primitive/each.types';
import { never } from '#src/permutation/primitive/never';
import type { Never } from '#src/permutation/primitive/never.types';
import { merge } from '#src/permutation/utils';

export function each(): Never;
export function each<const T extends readonly unknown[]>(...values: T): Each<T>;
export function each(...values: readonly unknown[]): Each | Never {
	if (values.length === 0) return never();
	return Object.assign(Object.create(null), {
		*[Symbol.iterator]() {
			yield* values;
		},
		get size() {
			return BigInt(values.length);
		},
		get modifiers() {
			return [] as readonly never[];
		},
		get originalInputArg() {
			return values;
		},
		get type() {
			return 'each' as const;
		},
		get structure() {
			return 'primitive' as const;
		},
		get permutationPaths() {
			return [] as readonly [];
		},
		get primitivePermutationPaths() {
			return [] as readonly [];
		},
		extract() {
			return never();
		},
		exclude() {
			return this;
		},
		generatorAt() {
			return never();
		},
		override(v) {
			return merge(this, v);
		},
	} satisfies Each);
}

export function isEach(v: PermutationGenerator): v is Each {
	return v.type === 'each';
}
