import type { PermutationGenerator } from '#src/permutation/definitions';
import { checkPermutationType } from '#src/permutation/primitive/check-permutation-type';
import { each } from '#src/permutation/primitive/each';
import type { Never } from '#src/permutation/primitive/never.types';
import type { Seal } from '#src/permutation/primitive/seal.types';
import { merge } from '#src/permutation/utils';

export function seal(input: Never): Never;
export function seal<const T extends PermutationGenerator>(input: Extract<T, Seal>): T;
export function seal<const T extends PermutationGenerator>(input: T): Seal<T>;
export function seal(input: PermutationGenerator): Seal | Never {
	if (checkPermutationType(input, 'seal') || checkPermutationType(input, 'never')) return input;
	return Object.assign(Object.create(null), {
		*[Symbol.iterator]() {
			yield* input;
		},
		get size() {
			return input.size;
		},
		get modifiers() {
			return input.modifiers;
		},
		get originalInputArg() {
			return input;
		},
		get type() {
			return 'seal' as const;
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
			return each();
		},
		exclude() {
			return this;
		},
		generatorAt() {
			return each();
		},
		override(v) {
			return merge(this, v);
		},
	} satisfies Seal);
}
