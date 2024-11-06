import type { PermutationContext, PermutationGenerator } from '#src/types/permutation.type';

export function context<const T>(
	input: PermutationGenerator<T>,
	newContextFn?: (parentContext?: PermutationContext) => PermutationContext,
): PermutationGenerator<T> {
	return function* (context) {
		yield* input(newContextFn?.(context));
	};
}
