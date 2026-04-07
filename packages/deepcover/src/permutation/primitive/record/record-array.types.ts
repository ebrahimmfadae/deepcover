import type { InferPermutationType, PermutationGenerator } from '#src/permutation/definitions';
import type { AsOptional } from '#src/permutation/modifiers/optional.types';
import type {
	BuildPermutationPath,
	StringifyPathRecord,
} from '#src/permutation/primitive/record/record.types';
import type { MultiplyTuple } from '#src/utils/arithmetic/multiply';
import type { Sum } from '#src/utils/arithmetic/sum';
import type { EntryValuesAsTuple, ExtractIndices } from '#src/utils/common';
import type { IfElse } from '#src/utils/conditional';
import type { ExpandableArray } from '#src/utils/expandable-check';
import type { SetTupleOptional } from '#src/utils/set-tuple-optional';

type RecordInput = ExpandableArray<PermutationGenerator>;

type GetOptionalKeys<T extends RecordInput> = {
	[K in keyof T]: IfElse<AsOptional<T[K]>, K, never>;
};

type UnwrapRecordInput<T extends RecordInput> = {
	[K in keyof T]: InferPermutationType<T[K]>;
};

type RecordOutputMapper<T extends RecordInput> = SetTupleOptional<
	UnwrapRecordInput<T> extends infer U extends readonly unknown[] ? U : never,
	GetOptionalKeys<T>[number] extends `${infer U extends number}` ? U : never
>;

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
	[K in ExtractIndices<T>]: BuildPermutationPath<K, T[K]['primitivePermutationPaths'], false>;
}>;

type RecordPermutationPaths<T extends RecordInput> = StringifyPathRecord<{
	[K in ExtractIndices<T>]: BuildPermutationPath<K, T[K]['permutationPaths'], true>;
}>;

export type RecordArray<
	T extends ExpandableArray<PermutationGenerator> = ExpandableArray<PermutationGenerator>,
> = PermutationGenerator<RecordOutputMapper<T>> & {
	readonly size: SizeAccumulator<T>;
	readonly originalInputArg: T;
	readonly type: 'record';
	readonly modifiers: readonly never[];
	readonly structure: 'array';
	readonly permutationPaths: readonly RecordPermutationPaths<T>[];
	readonly primitivePermutationPaths: readonly RecordPrimitivePermutationPaths<T>[];
};
