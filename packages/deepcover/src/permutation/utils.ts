import type { PermutationGenerator } from '#src/permutation/definitions';
import { clean } from '#src/permutation/modifiers/clean';
import { isOptional, optional } from '#src/permutation/modifiers/optional';
import { series } from '#src/permutation/primitive/series/series';
import { cachedIterable } from '#src/permutation/pure/cached-iterable';

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
 * To be used in outputMerge()
 */
export function optionalWiseConcat(
	a: PermutationGenerator,
	b: PermutationGenerator,
	merged?: PermutationGenerator,
): PermutationGenerator {
	// TODO: Maybe integrity of a and b and merged should be asserted. Or maybe finding a less
	//	integrity prone approach
	if (merged) {
		if (isOptional(merged)) throw new Error('`merged` should not be optional');
		if (isOptional(a) && isOptional(b)) return optional(series(clean(a), clean(b), merged));
		if (isOptional(a)) return series(clean(b), merged);
		if (isOptional(b)) return series(clean(a), merged);
		return merged;
	} else {
		if (isOptional(a) && isOptional(b)) return optional(series(clean(a), clean(b)));
		if (isOptional(a)) return b;
		if (isOptional(b)) return series(clean(a), clean(b));
	}
	return b;
}

// NOTE: Fixed threshold. Caching trades memory (grows with size) for not regenerating on every
//		restart. Expose it as an option if callers need to tune it.
const CACHE_SIZE_LIMIT = 10_000n;

/**
 * Caches small generators so restarting them inside a cartesian product replays them instead of
 * regenerating them. Large ones are re-iterated to keep memory bounded.
 */
export function cacheIfSmall<T>(v: Iterable<T>, size: bigint): Iterable<T> {
	return size <= CACHE_SIZE_LIMIT ? cachedIterable(v) : v;
}
