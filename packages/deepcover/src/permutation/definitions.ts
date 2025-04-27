export type Structure = 'array' | 'pojo' | 'mixed' | 'primitive';
export type Permutation<T = unknown> = Iterable<T>;
export type UnwrapPermutation<T extends Permutation> = T extends Permutation<infer U> ? U : never;
export type PermutationGenerator<out T extends Permutation = Permutation> = {
	readonly size: number;
	readonly originalInputArg: unknown;
	readonly type: string;
	readonly structure: Structure;
	/**
	 * Modifiers are like meta-data that are used only by consumers
	 * All modifiers should be idempotent
	 * All modifiers are meant to be used by top level structures
	 */
	readonly modifiers: string[];
	readonly permutationPaths: readonly string[];
	readonly primitivePermutationPaths: readonly string[];
	extract: (paths: readonly string[]) => PermutationGenerator;
	exclude: (paths: readonly string[]) => PermutationGenerator;
	generatorAt: (path: string) => PermutationGenerator;
	override: (v: PermutationGenerator) => PermutationGenerator;
	(): T;
};
export type UnwrapPermutationGenerator<T extends PermutationGenerator> =
	T extends PermutationGenerator<infer P> ? P : never;
