/**
 * This type can accept union of booleans as regular logical booleans.
 * We know that this is not the default behavior in TypeScript; Type `A | B` != `A || B`.
 * This is because we do negative check in this type. The same rule applies to `A & B` and `A && B`.
 */
export type IfElse<T, A, B, F = false> = [T] extends [F] ? B : A;
