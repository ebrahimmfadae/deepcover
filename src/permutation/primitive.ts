import { explicitPermutations, iterableWithIndex } from '#src/permutation/pure';
import { REMOVE } from '#src/permutation/symbols';
import type { MinPositive } from '#src/types/arithmetic/compare.type';
import type { MultiplyTuple } from '#src/types/arithmetic/multiply.type';
import type { Subtract } from '#src/types/arithmetic/subtract.type';
import type { Sum, SumTuple } from '#src/types/arithmetic/sum.type';
import type { Length, TupleToUnion } from '#src/types/common.type';
import type {
	ObjectGenerator,
	Permutation2,
	PermutationContext,
	PermutationGenerator2,
} from '#src/types/permutation.type';
import { deepEliminateKeys } from '#src/utils/elimination';
import type { ValuesAsTuple } from '#src/utils/entries';
import { convertToSchema, getPassiveSchemas, idempotentFreeze, isPOJO } from '#src/utils/utils';

function handlePlainObjectElimination<const T, const C extends PermutationContext>(
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
	const removeRoutePrefixes = startMatches.map((v) => v.replaceAll(`${currentRoute}.`, ''));
	// TODO: The below requirement is not necessary
	//		If there is no exact match in deep entries, return REMOVE
	//	It should be commented descriptively
	return deepEliminateKeys(input, removeRoutePrefixes);
}

export function one<const T>(value: T) {
	return function <const C extends PermutationContext>(context?: C) {
		return {
			...(context !== undefined && { context }),
			schema: value,
			size: 1,
			type: 'one',
			passive: false,
			*[Symbol.iterator]() {
				yield idempotentFreeze(handlePlainObjectElimination(value, context));
			},
		} as const;
	} satisfies PermutationGenerator2;
}

export function enums<const T extends unknown[]>(enums: T) {
	return function <const C extends PermutationContext>(context?: C) {
		return {
			...(context !== undefined && { context }),
			schema: enums,
			size: enums.length as Length<T>,
			type: 'enums',
			passive: false,
			*[Symbol.iterator](): Generator<TupleToUnion<T>> {
				for (const value of enums) {
					yield idempotentFreeze(handlePlainObjectElimination(value, context));
				}
			},
		} as const;
	} satisfies PermutationGenerator2;
}

export function defer<const T extends Permutation2>(input: PermutationGenerator2<T>) {
	return function <const C extends PermutationContext>(context?: C) {
		const r = input(context);
		return {
			...(context !== undefined && { context }),
			schema: convertToSchema(r),
			size: 1,
			type: 'defer',
			passive: true,
			*[Symbol.iterator]() {
				yield r;
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
		return {
			...(context !== undefined && { context }),
			schema: convertToSchema(r),
			size: (r.size + (isRedundant ? 0 : 1)) as Sum<T['size'], 1>,
			type: 'optional',
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
		return {
			...(context !== undefined && { context }),
			schema: convertToSchema(r),
			size: (hasOptional ? r.size - 1 : r.size) as S,
			type: 'required',
			passive: true,
			*[Symbol.iterator]() {
				for (const element of r)
					if (element !== REMOVE) yield element as Permutation2<Omit<P, typeof REMOVE>>;
			},
		} as const;
	} satisfies PermutationGenerator2;
}

export function max<const T extends Permutation2, const U extends number>(
	input: PermutationGenerator2<T>,
	max: Exclude<U, 0>,
) {
	return function <const C extends PermutationContext>(context?: C) {
		type U = T extends Permutation2<infer K> ? K : never;
		const r = input(context);
		return {
			...(context !== undefined && { context }),
			schema: convertToSchema(r),
			size: Math.min(max, r.size) as MinPositive<typeof max, T['size']>,
			type: 'max',
			passive: true,
			*[Symbol.iterator]() {
				yield* Iterator.from(r).take(max) as Generator<U>;
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
			passive: false,
			*[Symbol.iterator](): Generator<{
				[K in keyof T]: T[K] extends Permutation2<infer P> ? P : never;
			}> {
				yield* explicitPermutations(r);
			},
		} as const;
	} satisfies PermutationGenerator2;
}

export function uuid() {
	return function <const C extends PermutationContext>(context?: C) {
		return {
			...(context !== undefined && { context }),
			schema: 'UUID',
			size: Number.POSITIVE_INFINITY,
			type: 'uuid',
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
		return {
			...(context !== undefined && { context }),
			schema: { start, ...(end !== undefined && { end }) },
			size: (end ? end - start : Infinity) as number | undefined extends typeof end
				? number
				: Subtract<U, T>,
			type: 'index',
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
		const e = Object.entries(input);
		const e2 = context
			? e.map((u) =>
					objectHasMatchedRoute(context, u[0]) ? ([u[0], one(REMOVE)] as const) : u,
				)
			: e;
		const r = e2.map(([k, v]) => [k, v(appendRouteToObjectContext(k, context))] as const);
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
			...(context !== undefined && { context }),
			schema,
			size: size as MultiplyTuple<CastAsNumericArray<Sizes>>,
			type: 'object',
			passive: false,
			*[Symbol.iterator]() {
				yield* explicitPermutations(
					r.map((v) => Iterator.from(v[1]).map((u) => [v[0], u])),
				).map((v) => Object.fromEntries(v) as Readonly<ObjectGenerator<T>>);
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
			passive: true,
			*[Symbol.iterator]() {
				for (const g of r)
					yield* g as Permutation2<T[number] extends Permutation2<infer K> ? K : never>;
			},
		} as const;
	} satisfies PermutationGenerator2;
}

export function withIndex<const T extends Permutation2>(input: PermutationGenerator2<T>) {
	type U = T extends Permutation2<infer K> ? K : never;
	return function <const C extends PermutationContext>(context?: C) {
		const r = input(context);
		return {
			...(context !== undefined && { context }),
			schema: convertToSchema(r),
			size: r.size as T['size'],
			type: 'withIndex',
			passive: false,
			*[Symbol.iterator]() {
				yield* iterableWithIndex(r as Permutation2<U>);
			},
		} as const;
	} satisfies PermutationGenerator2;
}
