import type { PermutationGenerator } from '#src/permutation/definitions';
import type { Length } from '#src/utils/common';

export type Each<T extends readonly unknown[] = readonly unknown[]> = PermutationGenerator<
	T[number]
> & {
	readonly size: Length<T>;
	readonly modifiers: readonly never[];
	readonly originalInputArg: T;
	readonly type: 'each';
	readonly structure: 'primitive';
	readonly permutationPaths: readonly [];
	readonly primitivePermutationPaths: readonly [];
};
