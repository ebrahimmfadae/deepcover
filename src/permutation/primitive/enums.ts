import { NO_ROUTE } from '#src/permutation/symbols';
import { handlePlainObjectOrArrayElimination } from '#src/permutation/utils/elimination';
import { squashNoRoutes } from '#src/permutation/utils/routing';
import type { Length, TupleToUnion } from '#src/types/common.type';
import type { PermutationContext, PermutationGenerator2 } from '#src/types/permutation.type';
import { squashedDeepEntries } from '#src/utils/entries';
import { idempotentFreeze, isPOJO, typeSafeIsArray } from '#src/utils/utils';

export function enums<const T extends unknown[]>(enums: T) {
	const routes = enums.map((v) =>
		isPOJO(v) || typeSafeIsArray(v) ? squashedDeepEntries(v).map(([k]) => k) : NO_ROUTE,
	);
	const allRoutes = squashNoRoutes(routes.map((v) => ({ routes: v, size: 1 })));
	return function <const C extends PermutationContext>(context?: C) {
		return {
			...(context !== undefined && { context }),
			schema: enums,
			size: enums.length as Length<T>,
			type: 'enums',
			allRoutes,
			passive: false,
			*[Symbol.iterator](): Generator<TupleToUnion<T>> {
				for (const value of enums) {
					yield idempotentFreeze(handlePlainObjectOrArrayElimination(value, context));
				}
			},
		} as const;
	} satisfies PermutationGenerator2;
}
