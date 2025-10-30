import type {
	PermutationGenerator,
	PermutationPatch,
	UnwrapPermutation,
	UnwrapPermutationGenerator,
} from '#src/permutation/definitions';
import type { CastAsPermutationGenerator } from '#src/utils/casting';

type UnwrapValue<T> = UnwrapPermutation<UnwrapPermutationGenerator<CastAsPermutationGenerator<T>>>;

export type OptionalGenerator<out T extends PermutationGenerator> = () => Iterable<UnwrapValue<T>>;

export type AppendModifier<T extends readonly string[]> = 'optional' extends T[number]
	? T
	: readonly never[] extends T
		? readonly ['optional']
		: readonly ['optional', ...T];

export interface OptionalPatch<T extends PermutationGenerator> extends PermutationPatch {
	readonly size: T['size'];
	readonly modifiers: AppendModifier<T['modifiers']>;
	readonly originalInputArg: T;
	readonly type: T['type'];
	readonly structure: T['structure'];
}

export interface Optional<T extends PermutationGenerator = PermutationGenerator>
	extends OptionalGenerator<T>,
		OptionalPatch<T> {}
