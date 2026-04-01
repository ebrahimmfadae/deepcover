import type { InferPermutationType, PermutationGenerator } from '#src/permutation/definitions';

export type Seal<T extends PermutationGenerator = PermutationGenerator> = PermutationGenerator<
	InferPermutationType<T>
> & {
	readonly size: T['size'];
	readonly modifiers: T['modifiers'];
	readonly originalInputArg: T;
	readonly type: 'seal';
	readonly structure: 'primitive';
	readonly permutationPaths: readonly [];
	readonly primitivePermutationPaths: readonly [];
};
