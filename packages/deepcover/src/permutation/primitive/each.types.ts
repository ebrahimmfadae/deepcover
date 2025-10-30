import type { PermutationPatch } from '#src/permutation/definitions';
import type { Length, TupleToUnion } from '#src/utils/common';

export interface EachGenerator<out T extends readonly unknown[]> {
	(): Iterable<TupleToUnion<T>>;
}

export interface EachPatch<out T extends readonly unknown[]> extends PermutationPatch {
	readonly size: Length<T>;
	readonly modifiers: readonly never[];
	readonly originalInputArg: T;
	readonly type: 'each';
	readonly structure: 'primitive';
}

export interface Each<T extends readonly unknown[] = readonly unknown[]>
	extends EachGenerator<T>,
		EachPatch<T> {}
