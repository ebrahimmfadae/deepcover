import type { InferPermutationType, PermutationGenerator } from '#src/permutation/definitions';
import type { Clean } from '#src/permutation/modifiers/clean.types';

export function clean<const T extends PermutationGenerator>(input: T): Clean<T> {
	if (isClean(input)) return input as Clean<T>;
	return Object.assign(Object.create(null), {
		*[Symbol.iterator]() {
			yield* input as PermutationGenerator<InferPermutationType<T>>;
		},
		get size() {
			return input.size;
		},
		get modifiers() {
			return [] as readonly never[];
		},
		get originalInputArg() {
			return input.originalInputArg;
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
	} satisfies Clean<T>);
}

export function isClean(v: PermutationGenerator): v is Clean {
	return v.modifiers.length === 0;
}
