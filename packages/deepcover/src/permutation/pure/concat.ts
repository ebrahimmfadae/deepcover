import type { IterableElement } from 'type-fest';

export function* concat<const T extends readonly Iterable<unknown>[]>(
	...inputs: T
): Generator<IterableElement<T[number]>, void, unknown> {
	for (const element of inputs) yield* element as IterableElement<T[number]>[];
}
