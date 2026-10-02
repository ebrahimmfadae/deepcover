import { cachedIterable } from '#src/permutation/pure/cached-iterable';

export type ExplicitPermutations<T extends readonly Iterable<unknown>[]> = {
	[K in keyof T]: T[K] extends Iterable<infer U> ? U : never;
};

export function* explicitPermutations<const T extends readonly Iterable<unknown>[]>(
	input: T,
): Generator<ExplicitPermutations<T>, void, unknown> {
	if (input.length === 0) {
		yield [] as ExplicitPermutations<T>;
		return;
	}
	// Only one-shot iterables (whose iterator is themselves) need caching to be restarted.
	// Index 0 is never restarted, so it is never cached.
	const cacheIfEffective = input.map((v, i) =>
		i > 0 && (v[Symbol.iterator]() as unknown) === v ? cachedIterable(v) : v,
	);
	const iterables = cacheIfEffective.map((v) => Iterator.from(v));
	const output = new Array(iterables.length);
	for (let i = 0; i < iterables.length; i++) {
		const { done, value } = iterables[i]!.next();
		if (!done) output[i] = value;
	}
	// NOTE: When we yield the array without cloning, calling .toArray() would cause an issue
	// 		where first element is replaced by the last one.
	//			Example: Iterator.from(explicitPermutations([1,2,3])).toArray() eq [[3],[2],[3]]
	yield gapAwareClone(output) as ExplicitPermutations<T>;
	for (let pivot = input.length - 1; pivot >= 0; pivot--) {
		const { done, value } = iterables[pivot]!.next();
		if (done) continue;
		for (let i = pivot + 1; i < input.length; i++) {
			iterables[i] = Iterator.from(cacheIfEffective[i]!);
			const res = iterables[i]!.next();
			if (!res.done) output[i] = res.value;
		}
		output[pivot] = value;
		pivot = input.length;
		yield gapAwareClone(output) as ExplicitPermutations<T>;
	}
}

// Cloning an array in this way will preserve empty items
function gapAwareClone<T extends unknown[]>(v: T): T {
	const res = new Array(v.length) as T;
	v.forEach((u, i) => (res[i] = u));
	return res;
}
