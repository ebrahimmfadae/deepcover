import type { InferPermutationType, PermutationGenerator } from '#src/permutation/definitions';
import { each } from '#src/permutation/primitive/each';
import type { Seal, SealPatch } from '#src/permutation/primitive/seal.types';
import { merge } from '#src/permutation/utils';

export function seal<const T extends PermutationGenerator>(input: T): Seal<T> {
	if (isSealed(input)) return input as unknown as Seal<T>;
	return Object.assign(
		function* () {
			yield* input() as InferPermutationType<T>[];
		},
		{
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
		} satisfies SealPatch<T> & ThisType<Seal<T>>,
	);
}

export function isSealed(v: PermutationGenerator): v is Seal {
	return v.type === 'seal';
}
