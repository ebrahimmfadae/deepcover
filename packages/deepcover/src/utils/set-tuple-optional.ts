import type { ExpandableArray } from '#src/utils/expandable-check';
import type { ArraySplice, UnionToTuple } from 'type-fest';

type At<A extends ExpandableArray, K extends PropertyKey> = number extends A['length']
	? K extends number | `${number}`
		? A[never] | undefined
		: undefined
	: K extends keyof A
		? A[K]
		: undefined;
type Unionize<
	out L extends readonly unknown[],
	out L1 extends readonly unknown[],
	out K extends PropertyKey = PropertyKey,
> = Readonly<{
	[P in keyof L]: P extends K ? L[P] | At<L1, P> : L[P];
}>;
type UnionizeTuple<T extends readonly (readonly unknown[])[]> = T extends readonly [
	infer First extends readonly unknown[],
	infer Second extends readonly unknown[],
	...infer Rest extends readonly (readonly unknown[])[],
]
	? UnionizeTuple<readonly [Unionize<First, Second>, ...Rest]>
	: T;
/**
 * TypeScript (<=5.8.3) does not support arbitrary positioned optional key in tuples.
 *
 * "I'm limited by the technology of my time." Howard Stark
 */
export type SetTupleOptional<T extends ExpandableArray, K extends number> = readonly [] extends T
	? T
	: [K] extends [never]
		? T
		: UnionizeTuple<
				UnionToTuple<
					K extends unknown ? Readonly<ArraySplice<T, K, 1, [T[K]?]>> : never
				> extends infer U extends readonly ExpandableArray[]
					? U
					: never
			>[0];
