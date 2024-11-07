import { NO_ROUTE } from '#src/permutation/symbols';
import type { PermutationContext, PermutationGenerator2 } from '#src/types/permutation.type';

export function uuid<const T extends number>(max?: T) {
	return function <const C extends PermutationContext>(context?: C) {
		const size = max ?? Number.POSITIVE_INFINITY;
		return {
			...(context !== undefined && { context }),
			schema: 'v4',
			size,
			type: 'uuid',
			allRoutes: [{ routes: NO_ROUTE, size }],
			passive: false,
			*[Symbol.iterator]() {
				while (true) yield crypto.randomUUID();
			},
		} as const;
	} satisfies PermutationGenerator2;
}
