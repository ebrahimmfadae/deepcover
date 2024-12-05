import { cachedIterable } from '#src/permutation/pure/cached-iterable';

export type ExplicitPermutations<T extends readonly Iterable<unknown>[]> = {
	[K in keyof T]: T[K] extends Iterable<infer U> ? U : never;
};

export function* explicitPermutations<const T extends readonly Iterable<unknown>[]>(
	input: T,
): Generator<ExplicitPermutations<T>, void, unknown> {
	if (input.length === 0) return;
	if (input.length === 1) {
		const iterator = Iterator.from(input[0]!);
		yield* iterator.map((v) => [v] as ExplicitPermutations<T>);
	} else {
		const r = input.map((v) => cachedIterable(v));
		const generators = r.map((v) => Iterator.from(v));
		const output = generators
			.map((v) => v.next())
			.filter((v) => !v.done)
			.map((v) => v.value);
		loop: while (true) {
			yield output.map((v) => v) as ExplicitPermutations<T>;
			for (let pivot = input.length - 1; pivot >= 0; pivot--) {
				const { done, value } = generators[pivot]!.next();
				if (!done) {
					output[pivot] = value;
					break;
				}
				if (pivot === 0) break loop;
				generators[pivot] = Iterator.from(r[pivot]!);
				output[pivot] = generators[pivot]!.next().value!;
			}
		}
	}
}
