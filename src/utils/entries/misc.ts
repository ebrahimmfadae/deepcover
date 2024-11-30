import type { UnionToTuple } from '#src/types/union-to-tuple';

export type AllUnionPermutations<T, T2 extends T = T> = T extends unknown
	? Exclude<T2, T> extends never
		? readonly [T]
		: readonly [T, ...AllUnionPermutations<Exclude<T2, T>>]
	: never;
export type ValuesAsTuple<T extends Record<string, unknown>, U = UnionToTuple<keyof T>> = {
	[K in keyof U]: U[K] extends keyof T ? T[U[K]] : never;
};
