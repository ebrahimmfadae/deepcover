import type { Subtract } from '#src/types/arithmetic/subtract.type';

export type Eq<T extends number, U extends number> = T extends U
	? U extends T
		? true
		: false
	: false;

export type Min<T extends number, U extends number> = Subtract<T, U> extends never ? T : U;
