import type { Subtract } from '#src/utils/arithmetic/subtract';

export type Eq<T extends number, U extends number> = T extends U
	? U extends T
		? true
		: false
	: false;

export type MinPositive<T extends number, U extends number> = number extends T
	? U
	: Subtract<T, U> extends never
		? T
		: U;

export type MinTuple<T extends number[], N extends number = T[0]> = T extends [
	infer Head extends number,
	...infer U extends number[],
]
	? MinTuple<U, MinPositive<Head, N>>
	: N;
