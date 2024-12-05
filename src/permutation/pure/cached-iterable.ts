import { CACHED } from '#src/permutation/symbols';

export type CashedIterable<T> = Iterable<T> & { [CACHED]: CACHED };

export function cachedIterable<const T>(iterable: Iterable<T>): CashedIterable<T> {
	if (CACHED in iterable) return iterable as CashedIterable<T>;
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
	} as CashedIterable<T>;
}
