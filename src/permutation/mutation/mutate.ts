import { cachedIterable } from '#src/permutation/pure';
import { NO_ROUTE } from '#src/permutation/symbols';
import type {
	Permutation2,
	PermutationContext,
	PermutationGenerator2,
} from '#src/types/permutation.type';
import { constructChangeObject } from '#src/utils/compare/compare';
import { squashedDeepEntries } from '#src/utils/entries';
import { cleanRemoveValues, convertToSchema, deepMerge, isPOJO } from '#src/utils/utils';

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
