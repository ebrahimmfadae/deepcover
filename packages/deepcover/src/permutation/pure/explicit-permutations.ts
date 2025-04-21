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
	const cacheIfEffective = input.length === 1 ? input : input.map((v) => cachedIterable(v));
	const iterables = cacheIfEffective.map((v) => Iterator.from(v));
	const output = new Array(iterables.length);
	for (let i = 0; i < iterables.length; i++) {
		const { done, value } = iterables[i]!.next();
		if (!done) output[i] = value;
	}
	yield output as ExplicitPermutations<T>;
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
		yield [...output] as ExplicitPermutations<T>;
	}
}
