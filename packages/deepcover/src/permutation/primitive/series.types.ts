import type {
	InferPermutationType,
	PermutationGenerator,
	Structure,
} from '#src/permutation/definitions';
import type { StringifyPathRecord } from '#src/permutation/primitive/record.types';
import type { ExtractIndices } from '#src/utils/common';
import type { IfElse } from '#src/utils/conditional';
import type { SumTuple } from '#src/utils/exports';

export type SizeTuple<out T extends readonly PermutationGenerator[]> = Readonly<{
	[K in keyof T]: T[K]['size'];
}>;

export type SeriesSize<T extends readonly PermutationGenerator[]> =
	readonly PermutationGenerator[] extends T ? bigint : SumTuple<SizeTuple<T>>;

export type BuildPermutationPath<
	K extends string | number,
	T extends readonly string[],
	D,
> = string extends T[number]
	? string
	: T[number] extends never
		? `#${K}`
		: T[number] extends infer U extends string
			? IfElse<D, `#${K}` | `#${K}.${U}`, `#${K}.${U}`>
			: never;

export type SeriesPrimitivePermutationPaths<T extends readonly PermutationGenerator[]> =
	StringifyPathRecord<{
		[K in ExtractIndices<T>]: BuildPermutationPath<K, T[K]['primitivePermutationPaths'], false>;
	}>;

export type SeriesPermutationPaths<T extends readonly PermutationGenerator[]> =
	StringifyPathRecord<{
		[K in ExtractIndices<T>]: BuildPermutationPath<K, T[K]['permutationPaths'], true>;
	}>;

/**
 * TODO: This could be an interface but because of variance issues (`in`, `out`) we are forced to use type
 * Essentially PermutationGenerator<sub-T> is not assignable to PermutationGenerator<super-T>
 * Because of SeriesSize<T>. i.e. Each sub-T might have different size that makes them unassignable
 */
export type Series<T extends readonly PermutationGenerator[] = readonly PermutationGenerator[]> =
	PermutationGenerator<InferPermutationType<T[number]>> & {
		readonly size: SeriesSize<T>;
		readonly modifiers: readonly never[];
		readonly originalInputArg: readonly PermutationGenerator[];
		readonly type: 'series';
		readonly structure: Structure;
		readonly permutationPaths: readonly SeriesPermutationPaths<T>[];
		readonly primitivePermutationPaths: readonly SeriesPrimitivePermutationPaths<T>[];
	};
