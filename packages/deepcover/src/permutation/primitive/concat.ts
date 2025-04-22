import type {
	Permutation,
	PermutationGenerator,
	UnwrapPermutation,
} from '#src/permutation/definitions';
import { each } from '#src/permutation/exports';
import type { Sum } from '#src/utils/arithmetic/sum';
import type { Length } from '#src/utils/common';
import type { LiteralUnion, Paths } from 'type-fest';

export type ConcatContext<T extends Permutation, U extends unknown[]> = {
	readonly removeKeys?: readonly LiteralUnion<
		Paths<UnwrapPermutation<T> | U[number]> extends infer P extends string ? P : never,
		string
	>[];
};

export type ConcatIterable<T extends Permutation, U extends unknown[]> =
	Iterable<UnwrapPermutation<T> | U[number]> extends infer P ? P : never;

export type ConcatGenerator<T extends Permutation, U extends unknown[]> = {
	<const C extends ConcatContext<T, U>>(
		context: C,
	): {
		readonly size: number;
		readonly type: 'concat';
		readonly modifiers: T['modifiers'];
		readonly context: C;
	} & ConcatIterable<T, U>;
	<const C extends ConcatContext<T, U>>(
		context?: C,
	): {
		readonly size: Sum<T['size'], Length<U>>;
		readonly type: 'concat';
		readonly modifiers: T['modifiers'];
	} & ConcatIterable<T, U>;
} extends infer P extends PermutationGenerator
	? P
	: never;

export function concat<const T extends Permutation, const U extends unknown[]>(
	input: PermutationGenerator<T>,
	...values: U
) {
	return function (context) {
		const safeContext = { removeKeys: [], ...context };
		const r = input(safeContext);
		return {
			size: (r.size + values.length) as Sum<T['size'], Length<U>>,
			type: 'concat',
			modifiers: r.modifiers,
			...(context ? { context } : undefined),
			*[Symbol.iterator]() {
				yield* r;
				yield* each(...values)(safeContext);
			},
		};
	} as ConcatGenerator<T, U>;
}
