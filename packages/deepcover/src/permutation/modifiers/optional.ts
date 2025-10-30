import type { PermutationGenerator } from '#src/permutation/definitions';
import type {
	AppendModifier,
	Optional,
	OptionalPatch,
} from '#src/permutation/modifiers/optional.types';
import { merge } from '#src/permutation/utils';

export function optional<const T extends PermutationGenerator>(input: T): Optional<T> {
	if (isOptional(input)) return input as unknown as Optional<T>;
	const modifiers = ['optional', ...input.modifiers] as AppendModifier<T['modifiers']>;
	return Object.assign(
		function* () {
			yield* input();
		},
		{
			get size() {
				return input.size;
			},
			get modifiers() {
				return modifiers;
			},
			get originalInputArg() {
				return input.originalInputArg as T;
			},
			get type() {
				return input.type;
			},
			get structure() {
				return input.structure;
			},
			get permutationPaths() {
				return input.permutationPaths;
			},
			get primitivePermutationPaths() {
				return input.primitivePermutationPaths;
			},
			extract(paths) {
				return optional(input.extract(paths));
			},
			exclude(paths) {
				return optional(input.exclude(paths));
			},
			generatorAt(path) {
				return input.generatorAt(path);
			},
			override(v) {
				return merge(this, v);
			},
		} satisfies OptionalPatch<T> & ThisType<Optional<T>>,
	) as Optional<T>;
}

export function isOptional(v: PermutationGenerator): v is Optional {
	return v.modifiers.includes('optional');
}
