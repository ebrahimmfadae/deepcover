import type {
	PermutationGenerator,
	PermutationPatch,
	UnwrapPermutationGenerator,
} from '#src/permutation/definitions';

export type CleanGenerator<out T extends PermutationGenerator> = () => Iterable<
	UnwrapPermutationGenerator<T>
>;

export interface CleanPatch<T extends PermutationGenerator> extends PermutationPatch {
	readonly size: T['size'];
	readonly modifiers: readonly never[];
	readonly originalInputArg: T;
	readonly type: T['type'];
	readonly structure: T['structure'];
	readonly permutationPaths: readonly string[];
	readonly primitivePermutationPaths: readonly string[];
	readonly extract: (paths: readonly string[]) => PermutationGenerator;
	readonly exclude: (paths: readonly string[]) => PermutationGenerator;
	readonly generatorAt: (path: string) => PermutationGenerator;
	readonly override: (v: PermutationGenerator) => PermutationGenerator;
}

export interface Clean<T extends PermutationGenerator = PermutationGenerator>
	extends CleanGenerator<T>,
		CleanPatch<T> {}
