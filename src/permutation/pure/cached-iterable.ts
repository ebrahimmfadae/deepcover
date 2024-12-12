import { CACHED } from '#src/permutation/symbols';

export type CachedIterable<T> = Iterable<T> & { [CACHED]: CACHED };

export function cachedIterable<const T>(iterable: Iterable<T>): CachedIterable<T> {
	if (CACHED in iterable) return iterable as CachedIterable<T>;
	const cache: T[] = [];
	const g = iterable[Symbol.iterator]();
	return {
		[CACHED]: CACHED,
		*[Symbol.iterator](): Generator<T> {
			let i = 0;
			while (true) {
				if (i >= cache.length) {
					const { value, done } = g.next();
					if (done) break;
					cache.push(value);
				}
				yield cache[i++]!;
			}
		},
	} as CachedIterable<T>;
}
