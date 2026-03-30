import type {
	InferPermutationType,
	PermutationGenerator,
	PermutationPatch,
} from '#src/permutation/definitions';

export interface SealGenerator<out T extends PermutationGenerator> {
	(): Iterable<InferPermutationType<T>>;
}

export interface SealPatch<out T extends PermutationGenerator> extends PermutationPatch {
	readonly size: T['size'];
	readonly modifiers: T['modifiers'];
	readonly originalInputArg: T;
	readonly type: 'seal';
	readonly structure: 'primitive';
	readonly permutationPaths: readonly [];
	readonly primitivePermutationPaths: readonly [];
}

export interface Seal<T extends PermutationGenerator = PermutationGenerator>
	extends SealGenerator<T>,
		SealPatch<T> {}
