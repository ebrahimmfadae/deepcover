import type { InferPermutationType, PermutationGenerator } from '#src/permutation/definitions';

/**
 * This type has no variance issues and can be an interface
 */
export interface Clean<out T extends PermutationGenerator = PermutationGenerator>
	extends PermutationGenerator<InferPermutationType<T>> {
	readonly size: T['size'];
	readonly modifiers: readonly never[];
	readonly originalInputArg: T['originalInputArg'];
	readonly type: T['type'];
	readonly structure: T['structure'];
	readonly permutationPaths: T['permutationPaths'];
	readonly primitivePermutationPaths: T['primitivePermutationPaths'];
}
