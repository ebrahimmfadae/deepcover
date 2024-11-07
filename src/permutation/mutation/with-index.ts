import { iterableWithIndex } from '#src/permutation/pure';
import { NO_ROUTE } from '#src/permutation/symbols';
import type {
	Permutation2,
	PermutationContext,
	PermutationGenerator2,
} from '#src/types/permutation.type';
import { convertToSchema } from '#src/utils/utils';

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
