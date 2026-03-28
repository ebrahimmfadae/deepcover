export type Structure = 'array' | 'pojo' | 'mixed' | 'primitive';
export type Permutation<T = unknown> = Iterable<T>;
export type InferPermutationType<T extends PermutationGenerator> = UnwrapPermutation<
	UnwrapPermutationGenerator<T>
>;
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
	/**
	 * It does not act as a function that merges permutation schemas.
	 * It is equal to JS pure object merge after the permutations are generated.
	 *
	 * For example:
	 *
	 * 1. Two series are not concatenated, If there is a primitive generator in the `left`
	 * 	value it is completely ignored replaced by `right` values.
	 * 2. If there are two record fields with same path, the `right` one will replace `left` one.
	 * 3. All expandable object outputs are merged as regular object.
	 * 4. All not-mergeable values are replaced by `right` values. (primitive, not matching structures like pojo and array)
	 * 5. In mixed scenarios, we always respect the rule of JS pure object merge
	 *
	 * TODO: Maybe alter is a better name
	 */
	readonly override: (v: PermutationGenerator) => PermutationGenerator;
}
export interface PermutationGenerator<out T extends Permutation = Permutation>
	extends PermutationPatch {
	(): T;
}
export type UnwrapPermutationGenerator<T extends PermutationGenerator> =
	T extends PermutationGenerator<infer P> ? P : never;
