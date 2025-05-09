import type { PermutationGenerator } from '#src/permutation/definitions';
import type { Expandable, ExpandableArray, ExpandableObject } from '#src/utils/expandable-check';

export type CastAsArray<T> = T extends ExpandableArray ? T : never;
export type CastAsObject<T> = T extends ExpandableObject ? T : never;
export type CastAsExpandable<T> = T extends Expandable ? T : never;
export type CastAsNumber<T> = T extends number
	? T
	: T extends `${infer P extends number}`
		? P
		: never;
export type CastAsNumericArray<T> = T extends readonly number[] ? T : never;
export type CastAsPermutationGenerator<T> = T extends PermutationGenerator ? T : never;
