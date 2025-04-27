import type { PermutationGenerator } from '#src/permutation/definitions';
import {
	isEach,
	isRecord,
	isSeries,
	mergeRecord,
	mergeSeries,
	series,
} from '#src/permutation/exports';
import { clean } from '#src/permutation/modifiers/clean';

export function allPathLevels(path: string): string[] {
	const splitted = path.split('.');
	return Array.from(new Array(splitted.length), (_, i) => splitted.slice(0, i + 1).join('.'));
}

/**
 * Merging has one principle.
 * It should avoid generating the permutations that will be overrode in regular JavaScript object merging.
 * Exception: If only `b` is optional, the `a` is also assumed optional.
 */
export function merge(a: PermutationGenerator, b: PermutationGenerator): PermutationGenerator {
	if (isEach(a) && isEach(b)) return b;
	if (isEach(a) && isRecord(b)) return b;
	if (isEach(a) && isSeries(b)) return b;

	if (isRecord(a) && isEach(b)) return b;
	if (isRecord(a) && isRecord(b)) return mergeRecord(a, b);
	if (isRecord(a) && isSeries(b)) return mergeSeries(series(clean(a)), b);

	if (isSeries(a) && isEach(b)) return mergeSeries(a, series(clean(b)));
	if (isSeries(a) && isRecord(b)) return mergeSeries(a, series(clean(b)));
	if (isSeries(a) && isSeries(b)) return mergeSeries(a, b);
	return b;
}
