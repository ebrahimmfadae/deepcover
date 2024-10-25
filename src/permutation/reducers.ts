import type { PermutationGenerator } from '#src/types/permutation.type';

export function excludeEmptyObject<const T extends object>(
	generator: PermutationGenerator<T>,
): PermutationGenerator<T> {
	return function* (context) {
		yield* generator(context).filter((v) => Object.keys(v).length > 0);
	};
}

export function map<const T, const U>(
	input: PermutationGenerator<T>,
	mapFn: (value: T, index: number) => U,
): PermutationGenerator<U> {
	return function* (context) {
		yield* input(context).map(mapFn);
	};
}
