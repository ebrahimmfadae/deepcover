import type { PermutationGenerator } from '#src/permutation/definitions';
import type { RecordArray } from '#src/permutation/primitive/record-array.types';
import type { RecordPojo } from '#src/permutation/primitive/record-pojo.types';
import type { Stringify } from '#src/utils/common';
import type { IfElse } from '#src/utils/conditional';
import type { ExpandableArray, ExpandableObject } from '#src/utils/expandable-check';

export type RecordInput =
	| ExpandableObject<PermutationGenerator>
	| ExpandableArray<PermutationGenerator>;

export type StringifyPathRecord<U> =
	U extends Record<string, string>
		? keyof U extends never
			? string
			: Stringify<U[keyof U]>
		: never;

export type BuildPermutationPath<
	K extends string | number,
	T extends readonly string[],
	D,
> = string extends T[number]
	? string
	: T[number] extends never
		? `${K}`
		: T[number] extends infer U extends string
			? IfElse<D, `${K}` | `${K}.${U}`, `${K}.${U}`>
			: never;

/**
 * NOTE: Function param super-typing is another restriction in extended interfaces which is not in type intersections
 */
export type MyRecord<T extends RecordInput = RecordInput> = T extends unknown
	? T extends ExpandableArray<PermutationGenerator>
		? RecordArray<T>
		: T extends ExpandableObject<PermutationGenerator>
			? RecordPojo<T>
			: never
	: never;
