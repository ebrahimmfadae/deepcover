import { squashNoRoutes } from '#src/permutation/utils/routing';
import type { SumTuple } from '#src/types/arithmetic/sum.type';
import type {
	Permutation2,
	PermutationContext,
	PermutationGenerator2,
} from '#src/types/permutation.type';
import { convertToSchema } from '#src/utils/utils';

/**
 * Duplicate permutations will remain intact. You should handle it your self in order to get unique result.
 * @param input
 * @returns
 */
export function concat<const U extends PermutationGenerator2[]>(...input: U) {
	type T = { [K in keyof U]: U[K] extends PermutationGenerator2<infer P> ? P : never };
	return function <const C extends PermutationContext>(context?: C) {
		const r = input.map((v) => v(context));
		const size = r.reduce((acc, curr) => acc + curr.size, 0);
		const schema = r.map((v) => convertToSchema(v)) as {
			[K in keyof U]: U[K] extends PermutationGenerator2<infer P>
				? ReturnType<typeof convertToSchema<P>>
				: never;
		};
		return {
			...(context !== undefined && { context }),
			schema,
			size: size as SumTuple<{
				[K in keyof U]: U[K] extends PermutationGenerator2<infer P> ? P['size'] : never;
			}>,
			type: 'concat',
			allRoutes: squashNoRoutes(r.flatMap((v) => v.allRoutes)),
			passive: true,
			*[Symbol.iterator]() {
				for (const g of r)
					yield* g as Permutation2<T[number] extends Permutation2<infer K> ? K : never>;
			},
		} as const;
	} satisfies PermutationGenerator2;
}
