import { NO_ROUTE } from '#src/permutation/symbols';
import type { Subtract } from '#src/types/arithmetic/subtract.type';
import type { PermutationContext, PermutationGenerator2 } from '#src/types/permutation.type';

export function index<const T extends number = 0, const U extends number = number>(
	start: T = 0 as T,
	end?: U,
) {
	return function <const C extends PermutationContext>(context?: C) {
		const size = (end ? end - start : Infinity) as number | undefined extends typeof end
			? number
			: Subtract<U, T>;
		return {
			...(context !== undefined && { context }),
			schema: { start, ...(end !== undefined && { end }) },
			size,
			type: 'index',
			allRoutes: [{ routes: NO_ROUTE, size }],
			passive: false,
			*[Symbol.iterator]() {
				for (let i = start; i < (end ?? Infinity); i++) yield i as number;
			},
		} as const;
	} satisfies PermutationGenerator2;
}
