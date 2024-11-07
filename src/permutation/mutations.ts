import { one } from '#src/permutation/primitive';
import {
	cachedIterable,
	explicitPermutations,
	iterableWithIndex,
	parallelPermutations,
	permutations,
} from '#src/permutation/pure';
import { NO_ROUTE } from '#src/permutation/symbols';
import type { MinTuple } from '#src/types/arithmetic/compare.type';
import type { Multiply } from '#src/types/arithmetic/multiply.type';
import type { Subtract } from '#src/types/arithmetic/subtract.type';
import type { DeepMergeUnion, HardMerge } from '#src/types/merge.type';
import type {
	Permutation2,
	PermutationContext,
	PermutationGenerator2,
} from '#src/types/permutation.type';
import { constructChangeObject, type ChangeResult } from '#src/utils/compare/compare';
import { squashedDeepEntries } from '#src/utils/entries';
import { cleanRemoveValues, convertToSchema, deepMerge, isPOJO } from '#src/utils/utils';

export type HardMergeTuple<T extends Record<string, unknown>[]> = T extends [
	infer U,
	...infer P extends Record<string, unknown>[],
]
	? HardMerge<U, HardMergeTuple<P>>
	: unknown;

/**
 * The result size will be equal to smallest permutation
 * @param input
 * @returns
 */
export function parallelTuple<const T extends PermutationGenerator2[]>(input: T) {
	type U = { [K in keyof T]: T[K] extends PermutationGenerator2<infer P> ? P : never };
	type W = {
		[K in keyof U]: U[K] extends Permutation2<infer P> ? P : never;
	};
	return function <const C extends PermutationContext>(context?: C) {
		const r = input.map((v) => v(context));
		const size = Math.min(...r.map((v) => v.size));
		const schema = r.map((v) => convertToSchema(v)) as {
			[K in keyof U]: ReturnType<typeof convertToSchema<U[K]>>;
		};
		return {
			...(context !== undefined && { context }),
			schema,
			size: size as MinTuple<{
				[K in keyof U]: U[K]['size'];
			}>,
			type: 'parallelTuple',
			// TODO: Collapsing a route array should be in `seal` function
			allRoutes: [{ routes: NO_ROUTE, size: size }],
			passive: false,
			*[Symbol.iterator](): Generator<W> {
				yield* parallelPermutations(r);
			},
		} as const;
	} satisfies PermutationGenerator2;
}

export function mutate<const T extends Permutation2, const U extends Permutation2>(
	base: PermutationGenerator2<T>,
	mutation: PermutationGenerator2<U>,
) {
	return function <const C extends PermutationContext>(context?: C) {
		const r0 = base();
		const r1 = mutation(context);
		const m = r1.allRoutes.map((v) => {
			const removeRoutes = v.routes as unknown as string[];
			return [removeRoutes.join(','), base({ removeRoutes }), v.size] as const;
		});
		const e = m.map((v) => [v[0], cachedIterable(v[1])] as const);
		const size = m.map((v) => v[1].size * v[2]).reduce((acc, curr) => acc + curr, 0);
		return {
			...(context !== undefined && { context }),
			schema: {
				base: convertToSchema(r1),
				mutation: convertToSchema(r0),
			},
			size,
			type: 'mutate',
			// TODO: Collapsing a route array should be in `seal` function
			allRoutes: [{ routes: NO_ROUTE, size: size }],
			passive: false,
			*[Symbol.iterator]() {
				const removeRoutesCache = new Map(e);
				const baseWithAllKeys = cachedIterable(r0);
				for (const mutationObject of r1) {
					if (isPOJO(mutationObject) || Array.isArray(mutationObject)) {
						const mutationKeys = squashedDeepEntries(mutationObject);
						const removeRoutes = mutationKeys.map((v) => v[0]);
						const cacheKey = removeRoutes.join(',');
						const iterable =
							removeRoutesCache.get(cacheKey) ??
							cachedIterable(base({ removeRoutes }));
						if (!removeRoutesCache.has(cacheKey))
							removeRoutesCache.set(cacheKey, iterable);
						for (const before of iterable) {
							const cleanBefore = cleanRemoveValues(before);
							const after = cleanRemoveValues(deepMerge(cleanBefore, mutationObject));
							yield constructChangeObject(cleanBefore, after);
						}
					} else {
						for (const before of baseWithAllKeys) {
							const cleanBefore = cleanRemoveValues(before);
							yield constructChangeObject(cleanBefore, mutationObject);
						}
					}
				}
			},
		} as const;
	} satisfies PermutationGenerator2;
}

export function changePermutations<
	const T extends Permutation2,
	const U extends Permutation2,
	const R = unknown extends U ? ChangeResult<T> : ChangeResult<T, DeepMergeUnion<T | U>>,
>(input: PermutationGenerator2<T>, second?: PermutationGenerator2<U>) {
	return function <const C extends PermutationContext>(context?: C) {
		const r0 = input(context);
		const r1 = second?.(context);
		const size = r0.size * (r1?.size ?? r0.size - 1);
		type S = Permutation2 extends U
			? Multiply<T['size'], Subtract<T['size'], 1>>
			: Multiply<T['size'], U['size']>;
		return {
			...(context !== undefined && { context }),
			schema: {
				input: r0,
				...(r1 ? { second: r1 } : undefined),
			},
			size: size as S,
			type: 'changePermutations',
			// TODO: Collapsing a route array should be in `seal` function
			allRoutes: [{ routes: NO_ROUTE, size }],
			passive: false,
			*[Symbol.iterator]() {
				if (!second)
					yield* permutations(r0, { size: 2, exclusive: true }).map(
						([before, after]) => constructChangeObject(before, after) as R,
					);
				else
					yield* explicitPermutations([r0, r1!]).map(
						([before, after]) => constructChangeObject(before, after) as R,
					);
			},
		} as const;
	} satisfies PermutationGenerator2;
}

/**
 * Currently optional second is not supported, but it should be.
 * It is useful to deferred mutate an input using itself
 *
 * @param input
 * @param second
 * @returns
 */
export function deferredChangePermutations<
	const T extends Permutation2,
	const U extends Permutation2,
>(input: PermutationGenerator2<T>, second: PermutationGenerator2<U>) {
	return function <const C extends PermutationContext>(context?: C) {
		const r0 = input(context);
		const r1 = second(context);
		type T0 = T extends Permutation2<infer P> ? P : never;
		return {
			...(context !== undefined && { context }),
			schema: {
				input: r0,
				...(r1 ? { second: r1 } : undefined),
			},
			size: r0.size as T['size'],
			type: 'deferredChangePermutations',
			// TODO: Collapsing a route array should be in `seal` function
			allRoutes: [{ routes: NO_ROUTE, size: r0.size as T['size'] }],
			passive: false,
			*[Symbol.iterator]() {
				for (const before of r0) {
					const deferred = changePermutations(one(before as T0), second)(context);
					yield { before: before as T0, deferred: deferred };
				}
			},
		} as const;
	} satisfies PermutationGenerator2;
}

export function withIndex<const T extends Permutation2>(input: PermutationGenerator2<T>) {
	type U = T extends Permutation2<infer K> ? K : never;
	return function <const C extends PermutationContext>(context?: C) {
		const r = input(context);
		return {
			...(context !== undefined && { context }),
			schema: convertToSchema(r),
			size: r.size as T['size'],
			type: 'withIndex',
			// TODO: Collapsing a route array should be in `seal` function
			allRoutes: [{ routes: NO_ROUTE, size: r.size as T['size'] }],
			passive: false,
			*[Symbol.iterator]() {
				yield* iterableWithIndex(r as Permutation2<U>);
			},
		} as const;
	} satisfies PermutationGenerator2;
}
