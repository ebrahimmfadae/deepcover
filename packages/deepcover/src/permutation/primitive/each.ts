import type { PermutationGenerator } from '#src/permutation/definitions';
import type { Length, TupleToUnion } from '#src/utils/common';
import { removeEntryByPath } from '#src/utils/entries';
import type { LiteralUnion, Paths } from 'type-fest';

export type EachContext<T extends readonly unknown[]> = {
	readonly removeKeys?: readonly LiteralUnion<
		Paths<T[number]> extends infer U extends string ? U : never,
		string
	>[];
};

export type EachIterable<T extends readonly unknown[]> =
	Iterable<TupleToUnion<T>> extends infer U ? U : never;

export type EachGenerator<T extends readonly unknown[]> = {
	<const C extends EachContext<T>>(
		context: C,
	): {
		readonly size: number;
		readonly type: 'each';
		readonly modifiers: [];
		readonly context: C;
	} & EachIterable<T>;
	<const C extends EachContext<T>>(
		context?: C,
	): {
		readonly size: Length<T>;
		readonly type: 'each';
		readonly modifiers: [];
	} & EachIterable<T>;
} extends infer U extends PermutationGenerator
	? U
	: never;

export function each<const T extends readonly unknown[]>(...values: T) {
	return function (context) {
		const safeContext = { removeKeys: [], ...context };
		const { removeKeys } = safeContext;
		return {
			size: values.length as Length<T>,
			type: 'each',
			modifiers: [],
			...(context ? { context } : undefined),
			*[Symbol.iterator]() {
				yield* removeKeys.length > 0
					? values.map((v) => removeEntryByPath(v, removeKeys.at(0)!))
					: values;
			},
		} as const;
	} as EachGenerator<T>;
}
