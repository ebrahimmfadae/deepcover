import { isOptional } from '#src/permutation/modifiers/optional';
import { checkPermutationType } from '#src/permutation/primitive/check-permutation-type';
import type { Each } from '#src/permutation/primitive/each/each.types';
import { never } from '#src/permutation/primitive/never';
import type { Never } from '#src/permutation/primitive/never.types';
import { optionalWiseConcat } from '#src/permutation/utils';

/**
 * TODO: Remove this comment if it is no longer valid
 *
 * The output values are considered as distinct values in any internal comparison.
 * You can think of each value as a unique symbol consisting of (value,position).
 *
 * Example: `v != v` in `each(v) != each(v)` or `each(v,v) != each(v)`
 */
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
			return [] as const;
		},
		get primitivePermutationPaths() {
			return [] as const;
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
		subSchemaOf(v) {
			if (checkPermutationType(v, 'never')) return false;
			if (isOptional(v)) return false;
			return true;
		},
		merge(v) {
			return v;
		},
		outputMerge(v) {
			if (checkPermutationType(v, 'never')) return this;
			return optionalWiseConcat(this, v);
		},
		union() {
			throw new Error('Not yet implemented');
		},
	} satisfies Each);
}
