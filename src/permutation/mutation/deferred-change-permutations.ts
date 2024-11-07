import { changePermutations } from '#src/permutation/mutations';
import { one } from '#src/permutation/primitive/one';
import { NO_ROUTE } from '#src/permutation/symbols';
import type {
	Permutation2,
	PermutationContext,
	PermutationGenerator2,
} from '#src/types/permutation.type';

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
