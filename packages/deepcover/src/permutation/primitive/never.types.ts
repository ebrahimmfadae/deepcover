import type { PermutationGenerator } from '#src/permutation/definitions';

export type Never = PermutationGenerator<never> & {
	readonly size: 0n;
	readonly modifiers: readonly never[];
	readonly type: 'never';
	readonly structure: 'primitive';
	readonly permutationPaths: readonly [];
	readonly primitivePermutationPaths: readonly [];
};
