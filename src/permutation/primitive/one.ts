import { NO_ROUTE } from '#src/permutation/symbols';
import { handlePlainObjectOrArrayElimination } from '#src/permutation/utils/elimination';
import type { PermutationContext, PermutationGenerator2 } from '#src/types/permutation.type';
import { squashedDeepEntries } from '#src/utils/entries';
import { idempotentFreeze, isPOJO, typeSafeIsArray } from '#src/utils/utils';

export function one<const T>(value: T) {
	const routes =
		isPOJO(value) || typeSafeIsArray(value)
			? squashedDeepEntries(value).map(([k]) => k)
			: NO_ROUTE;
	return function <const C extends PermutationContext>(context?: C) {
		return {
			...(context !== undefined && { context }),
			schema: value,
			size: 1,
			type: 'one',
			allRoutes: [{ routes, size: 1 }],
			passive: false,
			*[Symbol.iterator]() {
				yield idempotentFreeze(handlePlainObjectOrArrayElimination(value, context));
			},
		} as const;
	} satisfies PermutationGenerator2;
}
