import type { PermutationGenerator } from '#src/permutation/definitions';
import { merge } from '#src/permutation/utils';
import type { Length, TupleToUnion } from '#src/utils/common';
import type { LiteralUnion, Paths } from 'type-fest';

export type EachContext<T extends readonly unknown[]> = {
	readonly removeKeys?: readonly LiteralUnion<
		Paths<T[number]> extends infer U extends string ? U : never,
		string
	>[];
};

export type EachIterable<T extends readonly unknown[]> =
	Iterable<TupleToUnion<T>> extends infer U ? U : never;

export type EachGenerator<T extends readonly unknown[] = readonly unknown[]> =
	() => EachIterable<T>;

export type EachPatch<T extends readonly unknown[] = readonly unknown[]> = {
	readonly size: Length<T>;
	readonly modifiers: [];
	readonly originalInputArg: readonly unknown[];
	readonly type: 'each';
	readonly structure: 'primitive';
	readonly permutationPaths: string[];
	readonly primitivePermutationPaths: string[];
	extract: (paths: readonly string[]) => PermutationGenerator;
	exclude: (paths: readonly string[]) => PermutationGenerator;
	generatorAt: (path: string) => PermutationGenerator;
	override: (v: PermutationGenerator) => PermutationGenerator;
};

export function each<const T extends readonly unknown[]>(
	...values: T
): EachGenerator<T> & EachPatch<T> {
	return Object.assign(
		function* () {
			yield* values;
		} as EachGenerator<T>,
		{
			get size() {
				return values.length as Length<T>;
			},
			get modifiers() {
				return [] as [];
			},
			get originalInputArg() {
				return values;
			},
			get type() {
				return 'each' as const;
			},
			get structure() {
				return 'primitive' as const;
			},
			get permutationPaths() {
				return [];
			},
			get primitivePermutationPaths() {
				return [];
			},
			extract(paths) {
				return paths.length > 0 ? each() : each(...values);
			},
			exclude(paths) {
				return paths.length > 0 ? each(...values) : each();
			},
			generatorAt() {
				return each(...values);
			},
			override(v) {
				return merge(this, v);
			},
		} satisfies EachPatch<T> & ThisType<EachGenerator<T> & EachPatch<T>>,
	) as EachGenerator<T> & EachPatch<T>;
}

export function isEach(v: PermutationGenerator): v is EachGenerator & EachPatch {
	return v.type === 'each';
}
