import { cachedIterable } from '#src/permutation/pure/cached-iterable';
import { iterableWithIndex } from '#src/permutation/pure/iterable-with-index';
import type { BuildTuple } from '#src/types/common.type';

const defaultPermutationsOptions: DefaultPermutationsOptions = {
	size: 1,
	exclusive: false,
	combination: false,
};

export type PermutationsOptions = Readonly<{
	size: number;
	exclusive?: boolean;
	combination?: boolean;
}>;

export type DefaultPermutationsOptions = PermutationsOptions &
	Readonly<{
		size: 1;
		exclusive: false;
		combination: false;
	}>;

export type Permutations<T, U extends PermutationsOptions> = U extends {
	readonly combination: true;
}
	? ReadonlySet<T> & { readonly size: U['size'] }
	: Readonly<BuildTuple<T, U['size']>>;

export function* permutations<
	const T,
	const U extends PermutationsOptions = typeof defaultPermutationsOptions,
>(input: Iterable<T>, options?: U): Generator<Permutations<T, U>, void, unknown> {
	const {
		size = defaultPermutationsOptions.size,
		exclusive = defaultPermutationsOptions.exclusive,
		combination = defaultPermutationsOptions.combination,
	} = options ?? ({} as PermutationsOptions);
	const iterator = Iterator.from(input);
	if (size < 1) return;
	if (size === 1) {
		yield* iterator.map((v) => (combination ? new Set([v]) : [v])) as Iterable<
			Permutations<T, U>
		>;
	} else {
		const indexedInput = cachedIterable(iterableWithIndex(iterator));
		const roller = Iterator.from(indexedInput)
			.take(size + 1)
			.toArray();
		if (roller.length === 0 || (exclusive && roller.length < size)) return;
		if (roller.length === 1 && !exclusive)
			yield (combination
				? new Set(new Array(size).fill(roller[0]![0]))
				: new Array(size).fill(roller[0]![0])) as unknown as Permutations<T, U>;
		else if (roller.length === size && exclusive)
			yield (combination
				? new Set(roller.map((v) => v[0]))
				: roller.map((v) => v[0])) as unknown as Permutations<T, U>;
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
					(!combination ||
						output.every((v, i) => i === 0 || v[1] >= output[i - 1]![1])) &&
					(!exclusive ||
						output.map((v) => v[1]).length === new Set(output.map((v) => v[1])).size)
				)
					yield (combination
						? new Set(output.map((v) => v[0]))
						: output.map((v) => v[0])) as unknown as Permutations<T, U>;
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