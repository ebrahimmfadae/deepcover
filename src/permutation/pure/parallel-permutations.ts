import { cachedIterable } from '#src/permutation/pure/cached-iterable';

export type ParallelPermutations<T extends readonly Iterable<unknown>[]> = {
	[K in keyof T]: T[K] extends Iterable<infer U> ? U : never;
};

export function* parallelPermutations<
	const T extends readonly Iterable<unknown>[],
	const R = ParallelPermutations<T>,
>(input: T): Generator<R, void, unknown> {
	if (input.length === 0) return;
	if (input.length === 1) {
		const iterator = Iterator.from(input[0]!);
		yield* iterator.map((v) => [v] as R);
	} else {
		const r = input.map((v) => cachedIterable(v));
		const generators = r.map((v) => Iterator.from(v));
		const output = generators.map((v) => v.next());
		while (true) {
			if (output.some((v) => v.done)) break;
			yield output.map((v) => v.value) as R;
			for (let pivot = input.length - 1; pivot >= 0; pivot--) {
				if (!output[pivot]?.done) output[pivot] = generators[pivot]!.next();
			}
		}
	}
}
