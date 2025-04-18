export type Permutation<T = unknown> = {
	readonly size: number;
	readonly type: string;
	/**
	 * Modifiers are like meta-data that are used only by consumers
	 * All modifiers should be idempotent
	 */
	readonly modifiers: string[];
} & Iterable<T>;
export type UnwrapPermutation<T extends Permutation> = T extends Permutation<infer U> ? U : never;
export type PermutationGenerator<T extends Permutation = Permutation> = () => T;
export type UnwrapPermutationGenerator<T extends PermutationGenerator> =
	T extends PermutationGenerator<infer P> ? P : never;
