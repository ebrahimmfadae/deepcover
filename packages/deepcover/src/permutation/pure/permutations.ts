import { cachedIterable } from '#src/permutation/pure/cached-iterable';
import { iterableWithIndex } from '#src/permutation/pure/iterable-with-index';
import type { BuildTuple } from '#src/utils/common';

const defaultPermutationsOptions = Object.freeze({
	size: 1,
	exclusive: false,
}) as { readonly size: 1; readonly exclusive: false };

export type PermutationsOptions = { readonly size: number; readonly exclusive?: boolean };

export type Permutations<T, U extends PermutationsOptions> = [T] extends [never]
	? never
	: number extends U['size']
		? T[]
		: 0 extends U['size']
			? never
			: Readonly<BuildTuple<T, U['size']>>;

export function* permutations<
	const T,
	const U extends PermutationsOptions = typeof defaultPermutationsOptions,
>(
	input: Iterable<T>,
	options?: U & PermutationsOptions,
): Generator<Permutations<T, U>, void, unknown> {
	const {
		size = defaultPermutationsOptions.size,
		exclusive = defaultPermutationsOptions.exclusive,
	} = options ?? ({} as PermutationsOptions);
	const iterator = Iterator.from(input);
	if (size < 1) return;
	if (size === 1) {
		yield* iterator.map((v) => [v]) as Iterable<Permutations<T, U>>;
	} else {
		const indexedInput = cachedIterable(iterableWithIndex(iterator));
		const roller = Iterator.from(indexedInput).toArray();
		if (roller.length === 0 || (exclusive && roller.length < size)) return;
		if (roller.length === 1 && !exclusive)
			yield new Array(size).fill(roller[0]![0]) as unknown as Permutations<T, U>;
		else if (roller.length === size && exclusive)
			yield roller.map((v) => v[0]) as unknown as Permutations<T, U>;
		else {
			const iterators = Array.from(new Array(size), (_, i) =>
				exclusive
					? Iterator.from(indexedInput).drop(i)
					: Iterator.from(Iterator.from(indexedInput)),
			);
			const output = iterators
				.map((v) => v.next())
				.filter((v) => !v.done)
				.map((v) => v.value);
			if (output.length < size) return;
			loop: while (true) {
				if (
					!exclusive ||
					output.map((v) => v[1]).length === new Set(output.map((v) => v[1])).size
				)
					yield output.map((v) => v[0]) as unknown as Permutations<T, U>;
				for (let pivot = size - 1; pivot >= 0; pivot--) {
					const { done, value } = iterators[pivot]!.next();
					if (!done) {
						output[pivot] = value;
						break;
					}
					if (pivot === 0) break loop;
					iterators[pivot] = Iterator.from(indexedInput);
					output[pivot] = iterators[pivot]!.next().value!;
				}
			}
		}
	}
}
