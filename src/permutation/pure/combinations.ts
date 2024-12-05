import { cachedIterable } from '#src/permutation/pure/cached-iterable';
import { explicitPermutations } from '#src/permutation/pure/explicit-permutations';
import { REMOVE } from '#src/permutation/symbols';
import { isPOJO } from '#src/utils/utils';

export type Combinations<
	T extends Record<string, Iterable<unknown>> | readonly Iterable<unknown>[],
> = { [K in keyof T]: T[K] | typeof REMOVE };

export function* combinations<
	const T extends Record<string, Iterable<unknown>> | Iterable<unknown>[],
>(input: T): Generator<Combinations<T>, void, unknown> {
	const entries = Object.entries(input);
	const slots = entries.map(([k, v]) => [
		[[k], cachedIterable(v)],
		[[k], [REMOVE]],
	]);
	const shouldConvertToObject = isPOJO(input);
	for (const element of explicitPermutations(slots)) {
		const result = explicitPermutations(element.map((v) => explicitPermutations(v)));
		if (shouldConvertToObject) yield* result.map((v) => Object.fromEntries(v));
		else yield* result.map((v) => v.map((u) => u[1])) as Iterable<Combinations<T>>;
	}
}
