export type IfElse<T, A, B, F = false> = [T] extends [F] ? B : A;
