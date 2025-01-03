import type { UnionToTuple } from '#src/types/union-to-tuple';

/**
 * TODO: Find a better place for this type. Currently it's in `src/utils/entries/misc.ts` and not used.
 */
export type UnionToPermutations<T, T2 extends T = T> = T extends unknown
	? Exclude<T2, T> extends never
		? readonly [T]
		: readonly [T, ...UnionToPermutations<Exclude<T2, T>>]
	: never;

export type RecordValuesAsTuple<T extends Record<string, unknown>, U = UnionToTuple<keyof T>> = {
	[K in keyof U]: U[K] extends keyof T ? T[U[K]] : never;
};
