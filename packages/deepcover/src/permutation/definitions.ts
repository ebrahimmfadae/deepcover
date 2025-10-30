export type Structure = 'array' | 'pojo' | 'mixed' | 'primitive';
export type Permutation<T = unknown> = Iterable<T>;
export type UnwrapPermutation<T extends Permutation> = T extends Permutation<infer U> ? U : never;
export interface PermutationPatch {
	readonly size: bigint;
	readonly originalInputArg?: unknown;
	readonly type: string;
	readonly structure: Structure;
	/**
	 * Modifiers are like meta-data that are used only by consumers
	 * All modifiers should be idempotent
	 * All modifiers are meant to be used by top level structures
	 */
	readonly modifiers: readonly string[];
	readonly permutationPaths: readonly string[];
	readonly primitivePermutationPaths: readonly string[];
	readonly extract: (paths: readonly string[]) => PermutationGenerator;
	readonly exclude: (paths: readonly string[]) => PermutationGenerator;
	readonly generatorAt: (path: string) => PermutationGenerator;
	readonly override: (v: PermutationGenerator) => PermutationGenerator;
}
export interface PermutationGenerator<out T extends Permutation = Permutation>
	extends PermutationPatch {
	(): T;
}
export type UnwrapPermutationGenerator<T extends PermutationGenerator> =
	T extends PermutationGenerator<infer P> ? P : never;
