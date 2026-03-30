import type {
	InferPermutationType,
	PermutationGenerator,
	PermutationPatch,
} from '#src/permutation/definitions';

export type CleanGenerator<out T extends PermutationGenerator> = () => Iterable<
	InferPermutationType<T>
>;

export interface CleanPatch<T extends PermutationGenerator> extends PermutationPatch {
	readonly size: T['size'];
	readonly modifiers: readonly never[];
	readonly originalInputArg: T['originalInputArg'];
	readonly type: T['type'];
	readonly structure: T['structure'];
	readonly permutationPaths: T['permutationPaths'];
	readonly primitivePermutationPaths: T['primitivePermutationPaths'];
}

export interface Clean<T extends PermutationGenerator = PermutationGenerator>
	extends CleanGenerator<T>,
		CleanPatch<T> {}
