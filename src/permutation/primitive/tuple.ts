import { one } from '#src/permutation/primitive/one';
import { explicitPermutations } from '#src/permutation/pure';
import { NO_ROUTE, REMOVE } from '#src/permutation/symbols';
import type { MultiplyTuple } from '#src/types/arithmetic/multiply.type';
import type {
	Permutation2,
	PermutationContext,
	PermutationGenerator2,
} from '#src/types/permutation.type';
import { convertToSchema } from '#src/utils/utils';

function tupleHasMatchedRoute<const C extends PermutationContext>(context: C, key: number) {
	return context?.removeRoutes
		? context.removeRoutes!.some((u) =>
				context?.route ? `${context.route}[${key}]` === u : `[${key}]` === u,
			)
		: false;
}

function appendRouteToTupleContext<const C extends PermutationContext>(
	key: number,
	context?: C,
): C | undefined {
	if (!context) return context;
	return {
		...context,
		route: context?.route ? `${context.route}[${key}]` : `[${key}]`,
	};
}

export function tuple<const U extends PermutationGenerator2[]>(input: U) {
	type T = { [K in keyof U]: U[K] extends PermutationGenerator2<infer P> ? P : never };
	return function <const C extends PermutationContext>(context?: C) {
		const e = context
			? input.map((v, i) => (tupleHasMatchedRoute(context, i) ? one(REMOVE) : v))
			: input;
		const r = e.map((v, i) => v(appendRouteToTupleContext(i, context)));
		const size = r.reduce((acc, curr) => acc * curr.size, 1);
		const schema = r.map((v) => convertToSchema(v)) as {
			[K in keyof T]: ReturnType<typeof convertToSchema<T[K]>>;
		};
		return {
			...(context !== undefined && { context }),
			schema,
			size: size as MultiplyTuple<{
				[K in keyof T]: T[K]['size'];
			}>,
			type: 'tuple',
			get allRoutes() {
				return explicitPermutations(
					r.map((v, i) =>
						v.allRoutes.map((u) => ({
							routes:
								u.routes === NO_ROUTE
									? `[${i}]`
									: u.routes.map((w) => `[${i}]${w}`),
							size: u.size,
						})),
					),
				)
					.map((v) => ({
						routes: v.map((u) => u.routes).flat(),
						size: v.reduce((acc, curr) => acc * curr.size, 1),
					}))
					.toArray();
			},
			passive: false,
			*[Symbol.iterator](): Generator<{
				[K in keyof T]: T[K] extends Permutation2<infer P> ? P : never;
			}> {
				yield* explicitPermutations(r);
			},
		} as const;
	} satisfies PermutationGenerator2;
}
