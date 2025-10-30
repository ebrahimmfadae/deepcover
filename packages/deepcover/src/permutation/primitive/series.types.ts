import type {
	PermutationGenerator,
	PermutationPatch,
	Structure,
	UnwrapPermutation,
	UnwrapPermutationGenerator,
} from '#src/permutation/definitions';
import type { CastAsPermutationGenerator } from '#src/utils/casting';
import type { SumTuple } from '#src/utils/exports';

type UnwrapValue<T> = UnwrapPermutation<UnwrapPermutationGenerator<CastAsPermutationGenerator<T>>>;

export type SeriesGenerator<out T extends readonly PermutationGenerator[]> = () => Iterable<
	UnwrapValue<T[number]>
>;

export type SizeTuple<out T extends readonly PermutationGenerator[]> = Readonly<{
	[K in keyof T]: T[K]['size'];
}>;

export type SeriesSize<T extends readonly PermutationGenerator[]> =
	readonly PermutationGenerator[] extends T ? bigint : SumTuple<SizeTuple<T>>;

export interface SeriesPatch<T extends readonly PermutationGenerator[]> extends PermutationPatch {
	readonly size: SeriesSize<T>;
	readonly modifiers: readonly never[];
	readonly originalInputArg: readonly PermutationGenerator[];
	readonly type: 'series';
	readonly structure: Structure;
}

/**
 * TODO: This should be an interface but because of variance issues (`in`, `out`) we are forced to use type
 */
export type Series<T extends readonly PermutationGenerator[] = readonly PermutationGenerator[]> =
	SeriesGenerator<T> & SeriesPatch<T>;
