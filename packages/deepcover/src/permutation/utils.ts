import type { PermutationGenerator } from '#src/permutation/definitions';

export function allPathLevels(path: string): string[] {
	const splitted = path.split('.');
	return Array.from(new Array(splitted.length), (_, i) => splitted.slice(0, i + 1).join('.'));
}

export function normalizedPaths(
	paths: readonly string[],
): Partial<Record<string, readonly string[]>> {
	return Object.groupBy(paths, (v) => v.replace(/#\d+\.|\.#\d$/g, ''));
}

/**
 * Merging has one principle.
 * It should avoid generating the permutations that will be overrode in regular JavaScript object merging.
 * Exception: If only `b` is optional, the `a` is also assumed optional.
 */
// TODO: Merging optional permutations is not handled very well
export function merge(a: PermutationGenerator, b: PermutationGenerator): PermutationGenerator {
	// if (isNever(a) && isNever(b)) return never();
	// if (!isOptional(a) && !isOptional(b)) {
	// 	if (isNever(a)) return b;
	// 	if (isNever(b)) return a;
	// 	if (isEach(a) || isEach(b)) return b;
	// } else if (isOptional(a) && isOptional(b)) {
	// } else if (isOptional(b)) {
	// 	if (isNever(a)) return b;
	// 	if (isNever(b)) return a;
	// } else if (isOptional(a)) {
	// }
	// if (isEach(a) || isEach(b)) return b;
	// if (isSealed(a) || isSealed(b)) return b;
	// if (isRecord(a)) {
	// 	if (isRecord(b)) return mergeRecord(a, b);
	// 	if (isSeries(b)) return mergeSeries(series(clean(a)), b);
	// }
	// if (isSeries(a)) {
	// 	if (isRecord(b)) return mergeSeries(a, series(clean(b)));
	// 	if (isSeries(b)) return mergeSeries(a, b);
	// }
	throw new Error('Illegal state: Unhandled merge');
}
