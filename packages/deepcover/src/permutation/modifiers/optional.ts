import type {
	PermutationGenerator,
	UnwrapPermutation,
	UnwrapPermutationGenerator,
} from '#src/permutation/definitions';
import { merge } from '#src/permutation/utils';
import type { CastAsPermutationGenerator } from '#src/utils/casting';

type UnwrapValue<T> = UnwrapPermutation<UnwrapPermutationGenerator<CastAsPermutationGenerator<T>>>;

export type OptionalGenerator<out T extends PermutationGenerator = PermutationGenerator> =
	() => Iterable<UnwrapValue<T>>;

export type OptionalPatch<T extends PermutationGenerator = PermutationGenerator> = {
	readonly size: T['size'];
	readonly modifiers: 'optional' extends T['modifiers'][number]
		? T['modifiers']
		: ['optional', ...T['modifiers']];
	readonly originalInputArg: T;
	readonly type: T['type'];
	readonly structure: T['structure'];
	readonly permutationPaths: readonly string[];
	readonly primitivePermutationPaths: readonly string[];
	extract: (paths: readonly string[]) => PermutationGenerator;
	exclude: (paths: readonly string[]) => PermutationGenerator;
	generatorAt: (path: string) => PermutationGenerator;
	override: (v: PermutationGenerator) => PermutationGenerator;
};

export function optional<const T extends PermutationGenerator>(
	input: T,
): OptionalGenerator<T> & OptionalPatch<T> {
	if (isOptional(input)) return input as unknown as OptionalGenerator<T> & OptionalPatch<T>;
	const modifiers = ['optional', ...input.modifiers];
	return Object.assign(
		function* () {
			yield* input();
		} as OptionalGenerator<T>,
		{
			get size() {
				return input.size;
			},
			get modifiers() {
				return modifiers;
			},
			get originalInputArg() {
				return input.originalInputArg as PermutationGenerator;
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
		} satisfies OptionalPatch & ThisType<OptionalGenerator<T> & OptionalPatch<T>>,
	) as OptionalGenerator<T> & OptionalPatch<T>;
}

export function isOptional(v: PermutationGenerator): v is OptionalGenerator & OptionalPatch {
	return v.modifiers.includes('optional');
}
