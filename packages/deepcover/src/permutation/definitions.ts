export type Context = { readonly removeKeys: readonly string[] };
export type Permutation<T = unknown> = {
	readonly size: number;
	readonly type: string;
	/**
	 * Modifiers are like meta-data that are used only by consumers
	 * All modifiers should be idempotent
	 */
	readonly modifiers: string[];
	readonly context?: Partial<Context>;
} & Iterable<T>;
export type UnwrapPermutation<T extends Permutation> = T extends Permutation<infer U> ? U : never;
export type PermutationGenerator<out T extends Permutation = Permutation> = <
	const C extends Partial<Context>,
>(
	context?: C,
) => T;
export type UnwrapPermutationGenerator<T extends PermutationGenerator> =
	T extends PermutationGenerator<infer P> ? P : never;
