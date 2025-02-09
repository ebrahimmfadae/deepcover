import { cachedIterable } from '#src/permutation/pure/cached-iterable';
import { explicitPermutations } from '#src/permutation/pure/explicit-permutations';
import { REMOVE } from '#src/permutation/symbols';
import { isExpandableObject, type Expandable } from '#src/utils/expandable-check';

export type ReadonlyExpandableOfIterables =
	| Readonly<Record<string, Iterable<unknown>>>
	| readonly Iterable<unknown>[];

export type Combinations<T extends ReadonlyExpandableOfIterables> = {
	[K in keyof T]: (T[K] extends Iterable<infer P> ? P : never) | typeof REMOVE;
} extends infer P extends Expandable
	? P
	: never;

export function* combinations<const T extends ReadonlyExpandableOfIterables>(
	input: T,
): Generator<Combinations<T>, void, unknown> {
	const entries = Object.entries(input);
	const slots = entries.map(([k, v]) => [
		[[k], cachedIterable(v)],
		[[k], [REMOVE]],
	]);
	const shouldConvertToObject = isExpandableObject(input);
	for (const element of explicitPermutations(slots)) {
		const result = explicitPermutations(element.map((v) => explicitPermutations(v)));
		if (shouldConvertToObject) yield* result.map((v) => Object.fromEntries(v));
		else yield* result.map((v) => v.map((u) => u[1])) as Iterable<Combinations<T>>;
	}
}
