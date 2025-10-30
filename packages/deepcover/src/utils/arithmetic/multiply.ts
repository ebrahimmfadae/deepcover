// Author: https://github.com/fangyang921017
// Link: https://github.com/type-challenges/type-challenges/issues/10339

type ArrayL<L extends string, R extends unknown[] = []> = `${R['length']}` extends L
	? R
	: ArrayL<L, [...R, unknown]>;

type S2Arr<S extends string, R extends string[] = []> = S extends `${infer X}${infer Y}`
	? S2Arr<Y, [...R, X]>
	: R;

type BitAdd<
	X extends string,
	Y extends string,
	Flag extends string,
> = `${[...ArrayL<X>, ...ArrayL<Y>, ...ArrayL<Flag>]['length'] & number}` extends `${infer A}${infer A1}${string}`
	? [A, A1]
	: ['0', `${[...ArrayL<X>, ...ArrayL<Y>, ...ArrayL<Flag>]['length'] & number}`];

type StrArr<X extends string[], Y extends string> = [...X, Y];
type _Sum<
	X extends string[],
	Y extends string[],
	R extends string = '',
	Flag extends string = '0',
> =
	X extends StrArr<infer X1, infer X2>
		? Y extends StrArr<infer Y1, infer Y2>
			? _Sum<X1, Y1, `${BitAdd<X2, Y2, Flag>[1]}${R}`, BitAdd<X2, Y2, Flag>[0]>
			: _Sum<X1, [], `${BitAdd<X2, '0', Flag>[1]}${R}`, BitAdd<X2, '0', Flag>[0]>
		: Y extends StrArr<infer Y1, infer Y2>
			? _Sum<[], Y1, `${BitAdd<'0', Y2, Flag>[1]}${R}`, BitAdd<'0', Y2, Flag>[0]>
			: Flag extends '1'
				? `1${R}`
				: R;

type Sum<A extends string, B extends string> = _Sum<S2Arr<`${A}`>, S2Arr<`${B}`>>;

type ArraySum<Arr extends string[], R extends string = '0'> =
	Arr extends StrArr<infer X, infer Y> ? ArraySum<X, Sum<R, Y>> : R;

type TimeLess10<
	Num extends string,
	T extends string,
	Iter extends unknown[] = [],
	Res extends string = '0',
> = `${Iter['length']}` extends T ? Res : TimeLess10<Num, T, [...Iter, unknown], Sum<Num, Res>>;

type _Multiply<
	X extends string,
	Y extends string[],
	R extends string[] = [],
	Flag extends string = '',
> = X extends '0'
	? '0'
	: Y extends StrArr<infer Y1, infer Y2>
		? _Multiply<X, Y1, [...R, TimeLess10<`${X}${Flag}`, Y2>], `0${Flag}`>
		: ArraySum<R>;

export type Multiply<A extends bigint, B extends bigint> = bigint extends A | B
	? bigint
	: _Multiply<`${A}`, S2Arr<`${B}`>> extends `${infer U extends bigint}`
		? U
		: never;

export type MultiplyTuple<
	T extends readonly bigint[],
	N extends bigint = 1n,
> = readonly [] extends T
	? 1n
	: T extends readonly [infer Head extends bigint, ...infer U extends readonly bigint[]]
		? MultiplyTuple<U, Multiply<Head, N>>
		: N;
