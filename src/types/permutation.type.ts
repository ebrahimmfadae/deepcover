import type { NO_ROUTE, REMOVE } from '#src/permutation/symbols';
import type { MergeIntersection } from '#src/types/merge.type';

type FixedSymbolCheck<T> = Extract<T, typeof REMOVE> extends never ? unknown : typeof REMOVE;
type OptionalKeys<T extends object> = {
	[K in keyof T]: FixedSymbolCheck<T[K]> extends typeof REMOVE ? K : never;
}[keyof T];
type AddQuestionMark<
	T extends object,
	O extends OptionalKeys<T> = OptionalKeys<T>,
> = MergeIntersection<
	{ [K in O]?: Exclude<T[K], typeof REMOVE> } & {
		[K in Exclude<keyof T, O>]: T[K];
	}
>;
export type ObjectGenerator<T extends Record<string, PermutationGenerator2>> = AddQuestionMark<{
	[K in keyof T]: GeneratorReturnType<T[K]>;
}>;
export type TupleRemap<T extends PermutationGenerator2[]> = {
	[K in keyof T]: GeneratorReturnType<T[K]>;
};

export type PermutationContext<T extends string = string> = {
	removeRoutes?: readonly T[];
	route?: T;
};
export type AllRoute = {
	readonly routes: readonly string[] | typeof NO_ROUTE;
	readonly size: number;
};
export type Permutation2<T = unknown> = {
	readonly context?: unknown;
	readonly schema: unknown;
	readonly size: number;
	readonly type: string;
	readonly allRoutes: readonly AllRoute[];
	// It is something like one-to-one functions in math. It means we can undo an attribute. Example: undo an optional
	//	Maybe we should rename it!
	// Properties of passive permutations:
	//		Order of appliance is not important
	//		They can be reversed
	//		They are idempotent (Not sure about this one)
	readonly passive: boolean;
} & Iterable<T>;

export type PermutationGenerator2<T extends Permutation2 = Permutation2> = (
	context?: PermutationContext,
) => T;
export type GeneratorReturnType<T extends PermutationGenerator2> =
	T extends PermutationGenerator2<infer U>
		? U extends Permutation2<infer K>
			? K
			: never
		: never;
