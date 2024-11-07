import { one } from '#src/permutation/primitive/one';
import { explicitPermutations } from '#src/permutation/pure';
import { NO_ROUTE, REMOVE } from '#src/permutation/symbols';
import type { MultiplyTuple } from '#src/types/arithmetic/multiply.type';
import type { CastAsNumericArray } from '#src/types/common.type';
import type {
	ObjectGenerator,
	PermutationContext,
	PermutationGenerator2,
} from '#src/types/permutation.type';
import type { ValuesAsTuple } from '#src/utils/entries';
import { convertToSchema } from '#src/utils/utils';

function objectHasMatchedRoute<const C extends PermutationContext>(context: C, key: string) {
	return context?.removeRoutes
		? context.removeRoutes!.some((u) =>
				context?.route ? `${context.route}.${key}` === u : key === u,
			)
		: false;
}

function appendRouteToObjectContext<const C extends PermutationContext>(
	key: string,
	context?: C,
): C | undefined {
	if (!context) return context;
	return {
		...context,
		route: context?.route ? `${context.route}.${key}` : key,
	};
}

export function object<const T extends Record<string, PermutationGenerator2>>(input: T) {
	return function <const C extends PermutationContext>(context?: C) {
		const ctx = context ?? {
			removeRoutes: [],
			route: '',
		};
		const e = Object.entries(input);
		const e2 = ctx
			? e.map((u) => (objectHasMatchedRoute(ctx, u[0]) ? ([u[0], one(REMOVE)] as const) : u))
			: e;
		const r = e2.map(([k, v]) => [k, v(appendRouteToObjectContext(k, ctx))] as const);
		const schemaEntries = r.map(([k, v]) => [k, convertToSchema(v)] as const);
		const schema = Object.fromEntries(schemaEntries) as {
			[K in keyof T]: T[K] extends PermutationGenerator2<infer P>
				? ReturnType<typeof convertToSchema<P>>
				: never;
		};
		const size = r.reduce((acc, curr) => acc * curr[1].size, 1);
		type Sizes =
			ValuesAsTuple<{
				[K in keyof T]: T[K] extends PermutationGenerator2<infer P> ? P['size'] : never;
			}> extends number[]
				? ValuesAsTuple<{
						[K in keyof T]: T[K] extends PermutationGenerator2<infer P>
							? P['size']
							: never;
					}>
				: never;
		return {
			...(ctx !== undefined && { context: ctx }),
			schema,
			size: size as MultiplyTuple<CastAsNumericArray<Sizes>>,
			type: 'object',
			get allRoutes() {
				return explicitPermutations(
					r.map((v) =>
						v[1].allRoutes.map((u) => ({
							routes:
								u.routes === NO_ROUTE
									? ctx?.route
										? [`.${v[0]}`]
										: [`${v[0]}`]
									: u.routes.map((w) =>
											ctx?.route ? `.${v[0]}${w}` : `${v[0]}${w}`,
										),
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
			*[Symbol.iterator]() {
				yield* explicitPermutations(
					r.map((v) => Iterator.from(v[1]).map((u) => [v[0], u])),
				).map((v) => Object.fromEntries(v) as Readonly<ObjectGenerator<T>>);
			},
		} as const;
	} satisfies PermutationGenerator2;
}
