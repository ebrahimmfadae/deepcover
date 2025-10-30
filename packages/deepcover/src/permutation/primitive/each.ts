import type { PermutationGenerator } from '#src/permutation/definitions';
import type { Each, EachPatch } from '#src/permutation/primitive/each.types';
import { merge } from '#src/permutation/utils';
import type { Length } from '#src/utils/common';

export function each<const T extends readonly unknown[]>(...values: T): Each<T> {
	return Object.assign(
		function* () {
			yield* values;
		},
		{
			get size() {
				return BigInt(values.length) as Length<T>;
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
				return [] as readonly string[];
			},
			get primitivePermutationPaths() {
				return [] as readonly string[];
			},
			extract(paths) {
				return paths.length > 0 ? each() : each(...values);
			},
			exclude(paths) {
				return paths.length > 0 ? each(...values) : each();
			},
			generatorAt() {
				return each(...values);
			},
			override(v) {
				return merge(this, v);
			},
		} satisfies EachPatch<T> & ThisType<Each<T>>,
	);
}

export function isEach(v: PermutationGenerator): v is Each {
	return v.type === 'each';
}
