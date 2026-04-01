import type { PermutationGenerator } from '#src/permutation/definitions';
import { clean } from '#src/permutation/modifiers/clean';
import { isEach } from '#src/permutation/primitive/each';
import { isNever, never } from '#src/permutation/primitive/never';
import { isRecord, mergeRecord } from '#src/permutation/primitive/record';
import { isSealed } from '#src/permutation/primitive/seal';
import { isSeries, mergeSeries, series } from '#src/permutation/primitive/series';

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
export function merge(a: PermutationGenerator, b: PermutationGenerator): PermutationGenerator {
	// TODO: Merging optional permutations is not handled very well
	if (isEach(a) || isEach(b)) return b;
	if (isSealed(a) || isSealed(b)) return b;
	if (isNever(a) && isNever(b)) return never();
	if (isNever(a)) return b;
	if (isNever(b)) return a;
	if (isRecord(a)) {
		if (isRecord(b)) return mergeRecord(a, b);
		if (isSeries(b)) return mergeSeries(series(clean(a)), b);
	}
	if (isSeries(a)) {
		if (isRecord(b)) return mergeSeries(a, series(clean(b)));
		if (isSeries(b)) return mergeSeries(a, b);
	}
	throw new Error('Illegal state: Unhandled merge');
}
