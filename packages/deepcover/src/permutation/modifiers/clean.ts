import type {
	PermutationGenerator,
	UnwrapPermutationGenerator,
} from '#src/permutation/definitions';

export type CleanGenerator<out T extends PermutationGenerator = PermutationGenerator> =
	() => Iterable<UnwrapPermutationGenerator<T>>;

export type CleanPatch<T extends PermutationGenerator = PermutationGenerator> = {
	readonly size: T['size'];
	readonly modifiers: [];
	readonly originalInputArg: T;
	readonly type: T['type'];
	readonly structure: T['structure'];
	readonly permutationPaths: readonly string[];
	readonly primitivePermutationPaths: readonly string[];
	extract: (paths: readonly string[]) => PermutationGenerator;
	exclude: (paths: readonly string[]) => PermutationGenerator;
	generatorAt: (path: string) => PermutationGenerator;
	override: (v: PermutationGenerator) => PermutationGenerator;
};

export function clean<const T extends PermutationGenerator>(
	input: T,
): CleanGenerator<T> & CleanPatch {
	if (isClean(input)) return input as CleanGenerator<T> & CleanPatch;
	const modifiers = [] as [];
	return Object.assign(
		function* () {
			yield* input();
		} as CleanGenerator<T>,
		{
			get size() {
				return input.size;
			},
			get modifiers() {
				return modifiers;
			},
			get originalInputArg() {
				return input.originalInputArg as PermutationGenerator;
			},
			get type() {
				return input.type;
			},
			get structure() {
				return input.structure;
			},
			get permutationPaths() {
				return input.permutationPaths;
			},
			get primitivePermutationPaths() {
				return input.primitivePermutationPaths;
			},
			extract(paths) {
				return clean(input.extract(paths));
			},
			exclude(paths) {
				return clean(input.exclude(paths));
			},
			generatorAt(path) {
				return input.generatorAt(path);
			},
			override(v) {
				return input.override(v);
			},
		} satisfies CleanPatch & ThisType<CleanGenerator<T> & CleanPatch>,
	) as CleanGenerator<T> & CleanPatch;
}

export function isClean(v: PermutationGenerator): v is CleanGenerator & CleanPatch {
	return v.modifiers.length === 0;
}
