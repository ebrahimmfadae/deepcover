// Author: https://github.com/dimitropoulos
// Link: https://github.com/type-challenges/type-challenges/issues/11577#issuecomment-1399397669

export type Subtract<
	M extends number,
	S extends number,
	Diff extends 1[] = [], // from S to M - 1
	Count extends 1[] = [], // from 0 to M - 1
	Started extends number = Diff extends [] ? Count['length'] : S,
> = Count['length'] extends M
	? S extends Started // stop when N = M
		? Diff['length'] // return length of Diff
		: never // when M < S
	: S extends Started
		? Subtract<M, S, [...Diff, 1], [...Count, 1]>
		: Subtract<M, S, Diff, [...Count, 1]>;
