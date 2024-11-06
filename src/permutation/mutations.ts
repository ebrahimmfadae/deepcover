import { one, required } from '#src/permutation/primitive';
import {
	cachedIterable,
	combinations,
	explicitPermutations,
	parallelPermutations,
	permutations,
} from '#src/permutation/pure';
import type { REMOVE } from '#src/permutation/symbols';
import type { MinTuple } from '#src/types/arithmetic/compare.type';
import type { Multiply, MultiplyTuple } from '#src/types/arithmetic/multiply.type';
import type { Subtract } from '#src/types/arithmetic/subtract.type';
import type { Sum } from '#src/types/arithmetic/sum.type';
import type { DeepMergeUnion, HardMerge, SquashObjectUnion } from '#src/types/merge.type';
import type {
	Permutation2,
	PermutationContext,
	PermutationGenerator2,
} from '#src/types/permutation.type';
import { constructChangeObject, type ChangeResult } from '#src/utils/compare/compare';
import {
	squashedDeepEntries,
	typeSafeEntries,
	typeSafeFromEntries,
	type Entries,
	type UnionToTuple,
} from '#src/utils/entries';
import { cleanRemoveValues, convertToSchema, deepMerge, isPOJO } from '#src/utils/utils';

type HardMergeTuple<T extends Record<string, unknown>[]> = T extends [
	infer U,
	...infer P extends Record<string, unknown>[],
]
	? HardMerge<U, HardMergeTuple<P>>
	: unknown;

/**
 * This function can't handle duplicated keys in generators. Till providing a solution, make sure every input has distinct keys.
 * @param input
 * @returns
 */
export function shallowMergeObjects<
	const T extends PermutationGenerator2<Permutation2<Record<string, unknown>>>[],
>(...input: T) {
	type U = { [K in keyof T]: T[K] extends PermutationGenerator2<infer P> ? P : never };
	type W = {
		[K in keyof U]: U[K] extends Permutation2<infer P extends Record<string, unknown>>
			? P
			: never;
	};
	return function <const C extends PermutationContext>(context?: C) {
		const r = input.map((v) => v(context));
		const size = r.reduce((acc, curr) => acc * curr.size, 1);
		const schema = r.map((v) => convertToSchema(v)) as {
			[K in keyof U]: ReturnType<typeof convertToSchema<U[K]>>;
		};
		return {
			...(context !== undefined && { context }),
			schema,
			size: size as MultiplyTuple<{
				[K in keyof U]: U[K]['size'];
			}>,
			type: 'mergeObjects',
			passive: false,
			*[Symbol.iterator](): Generator<HardMergeTuple<W>> {
				const p = explicitPermutations(r);
				for (const element of p) yield Object.assign({}, ...element);
			},
		} as const;
	} satisfies PermutationGenerator2;
}

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
		const size = r.reduce((acc, curr) => acc * curr.size, 1);
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
			passive: false,
			*[Symbol.iterator](): Generator<W> {
				yield* parallelPermutations(r);
			},
		} as const;
	} satisfies PermutationGenerator2;
}

export function objectCombinations<
	const T extends Record<string, PermutationGenerator2>,
	const E extends [keyof T, PermutationGenerator2][] = UnionToTuple<Entries<T>>,
>(input: T) {
	return function <const C extends PermutationContext>(context?: C) {
		type H = {
			[K in keyof E]: [
				E[K][0] & string,
				E[K][1] extends PermutationGenerator2<infer P>
					? ReturnType<typeof required<P>> extends (context?: C) => infer R
						? R
						: never
					: never,
			];
		};
		const e0 = typeSafeEntries(input);
		const e = e0.map(([k, v]) => [k, required(v)(context)] as const);
		const schemaEntries = e.map(([k, v]) => [k, convertToSchema(v)] as const) as {
			[K in keyof H]: [H[K][0], ReturnType<typeof convertToSchema<H[K][1]>>];
		};
		const schema = typeSafeFromEntries(schemaEntries) as SquashObjectUnion<
			{
				[K in keyof H]: { [key in H[K][0]]: ReturnType<typeof convertToSchema<H[K][1]>> };
			}[number]
		>;
		const size = e.reduce((acc, curr) => acc * (curr[1].size + 1), 1);
		type U = { [K in keyof H]: Sum<H[K][1]['size'], 1> };
		const m = typeSafeFromEntries(e);
		return {
			...(context !== undefined && { context }),
			schema,
			size: size as MultiplyTuple<U>,
			type: 'objectCombinations',
			passive: false,
			*[Symbol.iterator]() {
				yield* combinations(m) as Generator<{
					[K in keyof T]: T[K] extends PermutationGenerator2<infer U>
						? U extends Permutation2<infer P>
							? P | typeof REMOVE
							: never
						: never;
				}>;
			},
		} as const;
	} satisfies PermutationGenerator2;
}

export function mutate<const T extends Permutation2, const U extends Permutation2>(
	base: PermutationGenerator2<T>,
	mutation: PermutationGenerator2<U>,
) {
	return function <const C extends PermutationContext>(context?: C) {
		const r1 = mutation(context);
		// const size = r0.size * (r1?.size ?? r0.size - 1);
		return {
			...(context !== undefined && { context }),
			// schema: {
			// 	input: r0,
			// 	...(r1 ? { second: r1 } : undefined),
			// },
			// size: size as S,
			type: 'mutate',
			passive: false,
			*[Symbol.iterator]() {
				const removeRoutesCache = new Map();
				const baseWithAllKeys = cachedIterable(base());
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
							const after = cleanRemoveValues(deepMerge(before, mutationObject));
							yield constructChangeObject(before, after);
						}
					} else {
						for (const before of baseWithAllKeys)
							yield constructChangeObject(before, mutationObject);
					}
				}
			},
		} as const;
	} satisfies PermutationGenerator2;
	// return function* () {
	// 	for (const a of mutation({
	// 		excludeKeys: [],
	// 		preserveRemoves: true,
	// 		route: '',
	// 	})) {
	// 		if (isPOJO(a)) {
	// 			const mutationKeys = deepEntries(a);
	// 			if (mutationKeys.length === 0) continue;
	// 			for (const before of base({
	// 				excludeKeys: mutationKeys.map((v) => v[0]),
	// 				preserveRemoves: false,
	// 				route: '',
	// 			})) {
	// 				const after = cleanRemoveValues(deepMerge(before, a));
	// 				yield constructChangeObject(before, after);
	// 			}
	// 		} else {
	// 			for (const before of base()) {
	// 				const after = a;
	// 				yield constructChangeObject(before, after);
	// 			}
	// 		}
	// 	}
	// } as PermutationGenerator<ChangeResult<T, DeepMergeUnion<T | U>>>;
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
