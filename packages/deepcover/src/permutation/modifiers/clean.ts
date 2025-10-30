import type { PermutationGenerator } from '#src/permutation/definitions';
import type { CleanPatch, Clean } from '#src/permutation/modifiers/clean.types';

export function clean<const T extends PermutationGenerator>(input: T): Clean<T> {
	if (isClean(input)) return input as unknown as Clean<T>;
	return Object.assign(
		function* () {
			yield* input();
		},
		{
			get size() {
				return input.size;
			},
			get modifiers() {
				return [] as readonly never[];
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
				return clean(input.extract(paths));
			},
			exclude(paths) {
				return clean(input.exclude(paths));
			},
			generatorAt(path) {
				return input.generatorAt(path);
			},
			override(v) {
				return input.override(v);
			},
		} satisfies CleanPatch<T> & ThisType<T>,
	) as Clean<T>;
}

export function isClean(v: PermutationGenerator): v is Clean {
	return v.modifiers.length === 0;
}
