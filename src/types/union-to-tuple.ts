export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
	k: infer I,
) => void
	? I
	: never;
export type UnionToOverloads<T> = UnionToIntersection<T extends unknown ? (f: T) => void : never>;
export type PopUnion<T> = UnionToOverloads<T> extends (a: infer A extends T) => void ? A : never;
export type UnionToTuple<T, A extends readonly unknown[] = readonly []> = readonly [
	T,
] extends readonly [UnionToIntersection<T>]
	? readonly [T, ...A]
	: UnionToTuple<Exclude<T, PopUnion<T>>, readonly [PopUnion<T>, ...A]>;
