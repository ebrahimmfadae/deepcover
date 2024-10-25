import type { REMOVE } from '#src/permutation/symbols';
import type { MergeIntersection } from '#src/types/merge.type';

export type PermutationContext = {
	excludeKeys: string[];
	route: string;
	preserveRemoves: boolean;
};
export type PermutationGenerator<T = unknown> = (context?: PermutationContext) => Generator<T>;
export type GeneratorReturnType<T extends PermutationGenerator> =
	T extends PermutationGenerator<infer U> ? U : never;
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
export type ObjectGenerator<T extends Record<string, PermutationGenerator>> = AddQuestionMark<{
	[K in keyof T]: GeneratorReturnType<T[K]>;
}>;
export type TupleRemap<T extends PermutationGenerator[]> = {
	[K in keyof T]: GeneratorReturnType<T[K]>;
};
