import type { InferPermutationType, PermutationGenerator } from '#src/permutation/definitions';

export type AppendModifier<T extends readonly string[]> = 'optional' extends T[number]
	? T
	: readonly never[] extends T
		? readonly ['optional']
		: readonly ['optional', ...T];

export type Optional<T extends PermutationGenerator = PermutationGenerator> = PermutationGenerator<
	InferPermutationType<T>
> & {
	readonly size: T['size'];
	readonly modifiers: AppendModifier<T['modifiers']>;
	readonly originalInputArg: T['originalInputArg'];
	readonly type: T['type'];
	readonly structure: T['structure'];
	readonly permutationPaths: T['permutationPaths'];
	readonly primitivePermutationPaths: T['primitivePermutationPaths'];
};

export type AsOptional<T extends PermutationGenerator> = 'optional' extends T['modifiers'][number]
	? T
	: never;
