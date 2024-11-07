import { combinations, explicitPermutations } from '#src/permutation/pure';
import { NO_ROUTE, REMOVE } from '#src/permutation/symbols';
import type { MultiplyTuple } from '#src/types/arithmetic/multiply.type';
import type { Subtract } from '#src/types/arithmetic/subtract.type';
import type { Sum, SumTuple } from '#src/types/arithmetic/sum.type';
import type { Length, TupleToUnion } from '#src/types/common.type';
import type { SquashObjectUnion } from '#src/types/merge.type';
import type {
	ObjectGenerator,
	Permutation2,
	PermutationContext,
	PermutationGenerator2,
} from '#src/types/permutation.type';
import { deepEliminateKeys } from '#src/utils/elimination';
import {
	squashedDeepEntries,
	typeSafeEntries,
	typeSafeFromEntries,
	type Entries,
	type UnionToTuple,
	type ValuesAsTuple,
} from '#src/utils/entries';
import {
	convertToSchema,
	getPassiveSchemas,
	idempotentFreeze,
	isPOJO,
	typeSafeIsArray,
} from '#src/utils/utils';

function handlePlainObjectOrArrayElimination<const T, const C extends PermutationContext>(
	input: T,
	context?: C,
) {
	if (!context || !context.removeRoutes) return input;
	const currentRoute = context.route ?? '';
	const startMatches = context.removeRoutes.filter((v) => v.startsWith(currentRoute));
	const isRouteExcluded = startMatches.length > 0;
	if (!isRouteExcluded) return input;
	const exactMatch = context.removeRoutes.some((v) => v === currentRoute);
	if (exactMatch || (!isPOJO(input) && !Array.isArray(input))) return REMOVE;
	const objectOrArrayRoutePrefix = new RegExp(`${currentRoute}\\.?`, 'g');
	const removeRoutePrefixes = startMatches.map((v) => v.replaceAll(objectOrArrayRoutePrefix, ''));
	// TODO: The below requirement is not necessary
	//		If there is no exact match in deep entries, return REMOVE
	//	It should be commented descriptively
	return deepEliminateKeys(input, removeRoutePrefixes);
}

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

function squashNoRoutes<
	const T extends readonly { routes: readonly string[] | typeof NO_ROUTE; size: number }[],
>(input: T): readonly { routes: readonly string[] | typeof NO_ROUTE; size: number }[] {
	const notExistingRoutes = input.filter((v) => v.routes === NO_ROUTE);
	if (notExistingRoutes.length === 0) return input;
	const existedRoutes = input.filter((v) => v.routes !== NO_ROUTE);
	const noRouteSizes = notExistingRoutes.map((v) => v.size).reduce((acc, curr) => acc + curr, 0);
	return [{ routes: NO_ROUTE, size: noRouteSizes }, ...existedRoutes];
}

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

export function optional<const T extends Permutation2>(input: PermutationGenerator2<T>) {
	return function <const C extends PermutationContext>(context?: C) {
		const r = input(context);
		type P = T extends Permutation2<infer U> ? U : never;
		const passiveSchemas = getPassiveSchemas(r).map((v) => v.type);
		const isRedundant = passiveSchemas.includes('optional');
		const size = (r.size + (isRedundant ? 0 : 1)) as Sum<T['size'], 1>;
		const allRoutes = squashNoRoutes(
			r.allRoutes.concat(isRedundant ? [] : [{ routes: NO_ROUTE, size: 1 }]),
		);
		return {
			...(context !== undefined && { context }),
			schema: convertToSchema(r),
			size,
			type: 'optional',
			allRoutes,
			passive: true,
			*[Symbol.iterator]() {
				if (!isRedundant) yield REMOVE;
				for (const element of r) if (element !== REMOVE) yield element as P;
			},
		} as const;
	} satisfies PermutationGenerator2;
}

export function required<const T extends Permutation2>(input: PermutationGenerator2<T>) {
	return function <const C extends PermutationContext>(context?: C) {
		const r = input(context);
		type P = T extends Permutation2<infer U> ? U : never;
		const passiveSchemas = getPassiveSchemas(r).map((v) => v.type);
		const hasOptional = passiveSchemas.includes('optional');
		type S = typeof REMOVE extends P
			? number extends T['size']
				? number
				: Subtract<T['size'], 1>
			: T['size'];
		const allRoutes = [...squashNoRoutes(r.allRoutes)];
		if (hasOptional) {
			const v = allRoutes[0]!;
			if (v.routes === NO_ROUTE) {
				if (v.size > 1) v.size -= 1;
				else allRoutes.splice(0, 1);
			}
		}
		return {
			...(context !== undefined && { context }),
			schema: convertToSchema(r),
			size: (hasOptional ? r.size - 1 : r.size) as S,
			type: 'required',
			allRoutes,
			passive: true,
			*[Symbol.iterator]() {
				for (const element of r)
					if (element !== REMOVE) yield element as Permutation2<Omit<P, typeof REMOVE>>;
			},
		} as const;
	} satisfies PermutationGenerator2;
}

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

type CastAsNumericArray<T> = T extends number[] ? T : never;

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

export function inputCombinations<
	const T extends Record<string, PermutationGenerator2>,
	const E extends [keyof T, PermutationGenerator2][] = UnionToTuple<Entries<T>>,
>(input: T) {
	return function <const C extends PermutationContext>(context?: C) {
		const ctx = context ?? {
			removeRoutes: [],
			route: '',
		};
		type H = {
			[K in keyof E]: [
				E[K][0] & string,
				E[K][1] extends PermutationGenerator2<infer P>
					? ReturnType<typeof required<P>> extends (context?: C) => infer R
						? R
						: never
					: never,
			];
		};
		const e0 = typeSafeEntries(input);
		const e = e0.map(([k, v]) => [k, required(v)(context)] as const);
		const schemaEntries = e.map(([k, v]) => [k, convertToSchema(v)] as const) as {
			[K in keyof H]: [H[K][0], ReturnType<typeof convertToSchema<H[K][1]>>];
		};
		const schema = typeSafeFromEntries(schemaEntries) as SquashObjectUnion<
			{
				[K in keyof H]: { [key in H[K][0]]: ReturnType<typeof convertToSchema<H[K][1]>> };
			}[number]
		>;
		const size = e.reduce((acc, curr) => acc * (curr[1].size + 1), 1);
		type U = { [K in keyof H]: Sum<H[K][1]['size'], 1> };
		const m = typeSafeFromEntries(e);
		return {
			...(context !== undefined && { context }),
			schema,
			size: size as MultiplyTuple<U>,
			type: 'inputCombinations',
			get allRoutes() {
				return explicitPermutations(
					e.map((v) =>
						v[1].allRoutes.map((u) => ({
							routes:
								u.routes === NO_ROUTE
									? ctx?.route
										? [`.${v[0]}`]
										: [`${v[0]}`]
									: u.routes.map((w) =>
											ctx?.route ? `.${v[0]}${w}` : `${v[0]}${w}`,
										),
							size: u.size + 1,
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
				yield* combinations(m) as Generator<{
					[K in keyof T]: T[K] extends PermutationGenerator2<infer U>
						? U extends Permutation2<infer P>
							? P | typeof REMOVE
							: never
						: never;
				}>;
			},
		} as const;
	} satisfies PermutationGenerator2;
}

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
