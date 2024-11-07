import { parallelPermutations } from '#src/permutation/pure';
import { NO_ROUTE } from '#src/permutation/symbols';
import type { MinTuple } from '#src/types/arithmetic/compare.type';
import type {
	Permutation2,
	PermutationContext,
	PermutationGenerator2,
} from '#src/types/permutation.type';
import { convertToSchema } from '#src/utils/utils';

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
