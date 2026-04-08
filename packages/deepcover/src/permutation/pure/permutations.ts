import { cachedIterable } from '#src/permutation/pure/cached-iterable';
import { iterableWithIndex } from '#src/permutation/pure/iterable-with-index';
import type { BuildTuple } from '#src/utils/common';
import type { IfElse } from '#src/utils/conditional';
import type { IsEqual, IterableElement, LessThan } from 'type-fest';

const defaultPermutationsOptions = Object.freeze({
	size: 1,
	exclusive: false,
}) as { readonly size: 1; readonly exclusive: false };

export type PermutationsOptions = { readonly size: number; readonly exclusive?: boolean };

type Length<T> = readonly unknown[] extends T
	? number
	: T extends { length: infer L extends number }
		? L
		: never;

type BuildResultArray<T, S extends number> = [T] extends [never]
	? readonly []
	: number extends S
		? readonly T[]
		: Readonly<BuildTuple<T, S>>;

type CoalesceBoolean<T extends boolean | undefined> = IfElse<T, true, false, false | undefined>;

type IsTooShort<T extends Iterable<unknown>, S extends number> = LessThan<Length<T>, S>;

export type Permutations<T extends Iterable<unknown>, U extends PermutationsOptions> = IfElse<
	IsTooShort<T, U['size']>,
	IfElse<
		CoalesceBoolean<U['exclusive']> | IsEqual<Length<T>, 0>,
		never,
		BuildResultArray<IterableElement<T>, U['size']>
	>,
	BuildResultArray<IterableElement<T>, U['size']>
>;

export function permutations<const T extends Iterable<unknown>>(
	input: T,
): Generator<Permutations<T, typeof defaultPermutationsOptions>, void, unknown>;
export function permutations<
	const T extends Iterable<unknown>,
	const U extends PermutationsOptions,
>(input: T, options: U): Generator<Permutations<T, U>, void, unknown>;
export function* permutations(
	input: Iterable<unknown>,
	options?: PermutationsOptions,
): Generator<Permutations<Iterable<unknown>, PermutationsOptions>, void, unknown> {
	const {
		size = defaultPermutationsOptions.size,
		exclusive = defaultPermutationsOptions.exclusive,
	} = options ?? ({} as PermutationsOptions);
	const iterator = Iterator.from(input);
	if (size < 0) return;
	else if (size === 0) yield [];
	else if (size === 1) {
		yield* iterator.map((v) => [v]);
	} else {
		const indexedInput = cachedIterable(iterableWithIndex(iterator));
		const roller = Iterator.from(indexedInput).toArray();
		if (roller.length === 0 || (exclusive && roller.length < size)) return;
		if (roller.length === 1 && !exclusive) yield new Array(size).fill(roller[0]![0]);
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
					yield output.map((v) => v[0]);
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
