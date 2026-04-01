import type { InferPermutationType, PermutationGenerator } from '#src/permutation/definitions';
import type { AsOptional } from '#src/permutation/modifiers/optional.types';
import type {
	BuildPermutationPath,
	StringifyPathRecord,
} from '#src/permutation/primitive/record.types';
import type { MultiplyTuple } from '#src/utils/arithmetic/multiply';
import type { Sum } from '#src/utils/arithmetic/sum';
import type { EntryValuesAsTuple, ExtractKeys } from '#src/utils/common';
import type { IfElse } from '#src/utils/conditional';
import type { ExpandableObject } from '#src/utils/expandable-check';
import type { SetOptional } from 'type-fest';

type RecordInput = ExpandableObject<PermutationGenerator>;

type GetOptionalKeys<T extends RecordInput> = {
	[K in keyof T]: IfElse<AsOptional<T[K]>, K, never>;
};

type UnwrapValidRecordInput<T extends RecordInput> = {
	[K in keyof T]: InferPermutationType<T[K]>;
};

type RecordOutputMapper<T extends RecordInput> =
	SetOptional<UnwrapValidRecordInput<T>, GetOptionalKeys<T>[keyof T]> extends infer U ? U : never;

type SizeCalculator<T extends RecordInput> = {
	[K in keyof T]: IfElse<
		InferPermutationType<T[K]>,
		IfElse<AsOptional<T[K]>, Sum<T[K]['size'], 1n>, T[K]['size']>,
		1n
	>;
};

type SizeAccumulator<T extends RecordInput> = MultiplyTuple<
	Extract<EntryValuesAsTuple<SizeCalculator<T>>, readonly bigint[]>
>;

type RecordPrimitivePermutationPaths<T extends RecordInput> = StringifyPathRecord<{
	[K in ExtractKeys<T>]: BuildPermutationPath<K, T[K]['primitivePermutationPaths'], false>;
}>;

type RecordPermutationPaths<T extends RecordInput> = StringifyPathRecord<{
	[K in ExtractKeys<T>]: BuildPermutationPath<K, T[K]['permutationPaths'], true>;
}>;

export type RecordPojo<
	T extends ExpandableObject<PermutationGenerator> = ExpandableObject<PermutationGenerator>,
> = PermutationGenerator<RecordOutputMapper<T>> & {
	readonly size: SizeAccumulator<T>;
	readonly originalInputArg: T;
	readonly type: 'record';
	readonly modifiers: readonly never[];
	readonly structure: 'pojo';
	readonly permutationPaths: readonly RecordPermutationPaths<T>[];
	readonly primitivePermutationPaths: readonly RecordPrimitivePermutationPaths<T>[];
};
