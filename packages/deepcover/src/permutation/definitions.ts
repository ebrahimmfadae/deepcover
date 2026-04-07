// TODO: One typing issue is that for example Optional<Series> is not assignable to Series
// 		Second is that functions in PermutationPatch are not type-safe

// TODO: Find an eslint plugin to force override signature in interface implementations

export type Structure = 'array' | 'pojo' | 'mixed' | 'primitive';
export type Permutation<T = unknown> = Iterable<T>;
export type InferPermutationType<T extends PermutationGenerator> =
	T extends PermutationGenerator<infer U> ? U : never;
export interface PermutationGenerator<T = unknown> extends Iterable<T> {
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
	readonly extract: (paths?: readonly string[]) => PermutationGenerator;
	readonly exclude: (paths?: readonly string[]) => PermutationGenerator;
	readonly generatorAt: (path?: string) => PermutationGenerator;
	/**
	 * If `a` is sub schema of `b`, the `a` can be output merged by `b` in such a way that no output has any value of `a`.
	 */
	readonly subSchemaOf: (v: PermutationGenerator) => boolean;
	/**
	 * Performs a path-wise schema merging. The `modifiers` are merged based on modifier merging rules.
	 */
	readonly merge: (v: PermutationGenerator) => PermutationGenerator;
	/**
	 * Equal to JS pure object merge after the permutations are generated.
	 */
	readonly outputMerge: (v: PermutationGenerator) => PermutationGenerator;
	/**
	 * Performs a path-wise schema merging by unionizing. The `modifiers` are merged based on modifier merging rules.
	 */
	readonly union: (v: PermutationGenerator) => PermutationGenerator;
}

// TODO: I think we may need something like modifier merging guideline separated from
//			schema merging itself

// TODO: To simplify things we will solve the merging problem without modifiers first

/**
 * Modifier merging guideline
 *
 * Merge:
 * 	1. Modifier array will be unified
 */
