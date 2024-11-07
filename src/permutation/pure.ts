import { CACHED, REMOVE } from '#src/permutation/symbols';
import { isPOJO } from '#src/utils/utils';

type BuildTuple<T, S, U extends unknown[] = []> = number extends S
	? T[]
	: U extends { length: S }
		? U
		: BuildTuple<T, S, [...U, T]>;

export function* iterableWithIndex<const T>(input: Iterable<T>) {
	let i = 0;
	for (const element of input) yield [element, i++] as const;
}

export function cachedIterable<const T>(iterable: Iterable<T, void>) {
	if (CACHED in iterable) return iterable;
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
	} as Iterable<T>;
}

export function* permutations<
	const T,
	const U extends { size?: number; exclusive?: boolean; combination?: boolean } = {
		size: 1;
		exclusive: false;
		combination: false;
	},
	const R = U extends { combination: true }
		? ReadonlySet<T> & { size: U['size'] }
		: Readonly<BuildTuple<T, U['size']>>,
>(input: Iterable<T>, options?: U) {
	const { size = 1, exclusive = false, combination = false } = options ?? {};
	const iterator = Iterator.from(input);
	if (size < 1) return;
	if (size === 1) {
		yield* iterator.map((v) => (combination ? new Set([v]) : [v])) as Generator<R>;
	} else {
		const indexedInput = cachedIterable(iterableWithIndex(iterator));
		const roller = Iterator.from(indexedInput)
			.take(size + 1)
			.toArray();
		if (roller.length === 0 || (exclusive && roller.length < size)) return;
		if (roller.length === 1 && !exclusive)
			yield (
				combination
					? new Set(new Array(size).fill(roller[0]![0]))
					: new Array(size).fill(roller[0]![0])
			) as R;
		else if (roller.length === size && exclusive)
			yield (combination ? new Set(roller.map((v) => v[0])) : roller.map((v) => v[0])) as R;
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
					yield combination
						? (new Set(output.map((v) => v[0])) as R)
						: (output.map((v) => v[0]) as R);
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

export function* explicitPermutations<
	const T extends Iterable<unknown>[],
	const R = Readonly<{ [K in keyof T]: T[K] extends Iterable<infer U> ? U : never }>,
>(input: T) {
	if (input.length === 0) return;
	if (input.length === 1) {
		const iterator = Iterator.from(input[0]!);
		yield* iterator.map((v) => [v] as R);
	} else {
		const r = input.map((v) => cachedIterable(v));
		const generators = r.map((v) => Iterator.from(v));
		const output = generators
			.map((v) => v.next())
			.filter((v) => !v.done)
			.map((v) => v.value);
		loop: while (true) {
			yield output.map((v) => v) as R;
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

export function* parallelPermutations<
	const T extends Iterable<unknown>[],
	const R = Readonly<{ [K in keyof T]: T[K] extends Iterable<infer U> ? U : never }>,
>(input: T) {
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

export function* combinations<
	const T extends Record<string, Iterable<unknown>> | Iterable<unknown>[],
>(input: T): Generator<Readonly<{ [K in keyof T]: T[K] | typeof REMOVE }>> {
	const entries = Object.entries(input);
	const slots = entries.map(([k, v]) => [
		[[k], cachedIterable(v)],
		[[k], [REMOVE]],
	]);
	const shouldConvertToObject = isPOJO(input);
	for (const element of explicitPermutations(slots)) {
		const result = explicitPermutations(element.map((v) => explicitPermutations(v)));
		if (shouldConvertToObject) yield* result.map((v) => Object.fromEntries(v));
		else
			yield* result.map((v) => v.map((u) => u[1])) as Iterable<
				Readonly<{ [K in keyof T]: T[K] | typeof REMOVE }>
			>;
	}
}
