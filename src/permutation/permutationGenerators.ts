import { compare } from '../utils/compare/compare';
import type { TupleToUnion } from '../types/common.type';
import type { DeepMergeUnion, HardMerge, MergeIntersection } from '../types/merge.type';
import { cachedGenerator, cleanRemoveValues, deepMerge, isPOJO, routes } from '../utils/utils';

export const REMOVE = Symbol.for('REMOVE');
export const EXCLUDE = Symbol.for('EXCLUDE');

export type PermutationContext = {
	excludeKeys: string[];
	route: string;
	preserveRemoves: boolean;
};

export type PermutationGenerator<T = unknown> = (context?: PermutationContext) => Generator<T>;

export type GeneratorReturnType<T extends PermutationGenerator> =
	T extends PermutationGenerator<infer U> ? U : never;
type NotDefined = typeof REMOVE;
type FixedSymbolCheck<T> = Extract<T, NotDefined> extends never ? void : typeof REMOVE;
type OptionalKeys<T extends object> = {
	[K in keyof T]: FixedSymbolCheck<T[K]> extends NotDefined ? K : never;
}[keyof T];
type AddQuestionMark<
	T extends object,
	O extends OptionalKeys<T> = OptionalKeys<T>,
> = MergeIntersection<
	{ [K in O]?: Exclude<T[K], typeof REMOVE> } & {
		[K in Exclude<keyof T, O>]: T[K];
	}
>;
export type ObjectGenerator<T extends Record<string, PermutationGenerator>> = AddQuestionMark<{
	[K in keyof T]: GeneratorReturnType<T[K]>;
}>;
export type TupleRemap<T extends PermutationGenerator[]> = {
	[K in keyof T]: GeneratorReturnType<T[K]>;
};

export function counter(start = 0) {
	return function* () {
		for (let i = start; ; i++) {
			yield i;
		}
	};
}

export function max<const T>(
	generator: PermutationGenerator<T>,
	max: number,
): PermutationGenerator<T> {
	return function* (context) {
		const g = generator(context);
		for (let i = 0; i < max; i++) {
			const { value, done } = g.next();
			if (done) return value;
			yield value;
		}
	};
}

export function append<
	const T extends Record<string, unknown>,
	U extends PermutationGenerator<Record<string, unknown>>,
	R = DeepMergeUnion<HardMerge<T, GeneratorReturnType<U>>>,
>(generator: PermutationGenerator<T>, permute: (permutation: T) => U): PermutationGenerator<R> {
	return function* (context) {
		for (const v of generator(context)) {
			for (const u of permute(v)(context)) {
				yield { ...v, ...u } as R;
			}
		}
	};
}

export function appendInfinite<
	const T extends Record<string, unknown>,
	U extends PermutationGenerator<Record<string, unknown>>,
	R = HardMerge<T, GeneratorReturnType<U>>,
>(generator: PermutationGenerator<T>, permute: U): PermutationGenerator<R> {
	return function* (context) {
		const g = generator(context);
		const p = permute(context);
		for (const v of g) {
			const { done, value } = p.next();
			if (done) throw Error('Illegal state');
			yield { ...v, ...value } as R;
		}
	};
}

export function enums<const T extends any[]>(enums: T): PermutationGenerator<TupleToUnion<T>> {
	return function* (context) {
		for (const value of enums) {
			if (isPOJO(value) || context?.excludeKeys.every((v) => !v.startsWith(context.route)))
				yield value;
		}
	};
}

export function tuple<const T, const U extends PermutationGenerator<T>[]>(
	enums: [...U],
): PermutationGenerator<TupleRemap<U>> {
	return function* (context) {
		if (enums.length === 1) {
			for (const value of enums[0](context)) {
				yield [value] as TupleRemap<U>;
			}
		} else {
			const [head, ...rest] = enums;
			const cachedYieldPermute = cachedGenerator(tuple(rest)(context));
			for (const value of head(context)) {
				for (const subPermutation of cachedYieldPermute()) {
					yield [value, ...subPermutation] as TupleRemap<U>;
				}
			}
		}
	};
}

export function object<const T extends Record<string, PermutationGenerator>>(
	input: T,
): PermutationGenerator<ObjectGenerator<T>> {
	return function* (
		context = {
			excludeKeys: [],
			route: '',
			preserveRemoves: false,
		},
	) {
		const allKeys = Object.keys(input) as string[];
		if (allKeys.length === 0) {
			yield {} as ObjectGenerator<T>;
			return;
		}
		const pivotKey = allKeys[0]!;
		const fullKey = context.route ? `${context.route}.${pivotKey}` : pivotKey;
		const shallowClone = { ...input };
		const element = shallowClone[pivotKey]!;
		delete shallowClone[pivotKey];
		const shouldSkip = context.excludeKeys.some((k) => k === fullKey);
		if (allKeys.length === 1) {
			if (shouldSkip) {
				yield {} as ObjectGenerator<T>;
			} else {
				for (const value of element({ ...context, route: fullKey })) {
					if ((!context.preserveRemoves && value === REMOVE) || value === EXCLUDE)
						yield {} as ObjectGenerator<T>;
					else yield { [pivotKey]: value } as ObjectGenerator<T>;
				}
			}
		} else {
			const cachedYieldPermute = cachedGenerator(object(shallowClone)(context));
			if (shouldSkip) {
				yield* cachedYieldPermute();
			} else {
				for (const value of element({ ...context, route: fullKey })) {
					for (const subPermutation of cachedYieldPermute()) {
						const p =
							(!context.preserveRemoves && value === REMOVE) || value === EXCLUDE
								? {}
								: ({ [pivotKey]: value } as ObjectGenerator<T>);
						yield Object.assign({}, p, subPermutation) as ObjectGenerator<T>;
					}
				}
			}
		}
	};
}

export function combinations<const T extends Record<string, PermutationGenerator>>(
	input: T,
): PermutationGenerator<ObjectGenerator<T>> {
	const e = Object.entries(input).map(([k, v]) => [k, exclude(v)]);
	const m = Object.fromEntries(e) as T;
	return function* (context) {
		yield* object(m)(context);
	};
}

export function one<const T>(value: T): PermutationGenerator<T> {
	return function* () {
		yield value;
	};
}

export function optional<const T>(
	generator: PermutationGenerator<T | typeof REMOVE>,
): PermutationGenerator<T | typeof REMOVE> {
	return function* (context) {
		yield* generator(context);
		yield REMOVE;
	};
}

export function exclude<const T>(
	generator: PermutationGenerator<T | typeof EXCLUDE>,
): PermutationGenerator<T | typeof EXCLUDE> {
	return function* (context) {
		yield* generator(context);
		yield EXCLUDE;
	};
}

export function uuid(): PermutationGenerator<string> {
	return function* () {
		while (true) {
			yield crypto.randomUUID();
		}
	};
}

export function excludeEmptyObject<const T extends object>(
	generator: PermutationGenerator<T>,
): PermutationGenerator<T> {
	return function* (context) {
		yield* generator(context).filter((v) => Object.keys(v).length > 0);
	};
}

export function mutate<
	const T extends PermutationGenerator<object>,
	const U extends PermutationGenerator<object>,
>(base: T, mutation: U): PermutationGenerator<object> {
	return function* (context) {
		for (const a of mutation(context)) {
			const mutationKeys = routes(a);
			if (mutationKeys.length === 0) continue;
			for (const b of base({
				excludeKeys: mutationKeys,
				preserveRemoves: true,
				route: '',
			})) {
				yield { data: cleanRemoveValues(deepMerge(b, a)), mutations: mutationKeys };
			}
		}
	};
}

export function unwrapMutate<const T extends PermutationGenerator<{ data: any }>>(
	input: T,
): PermutationGenerator<any> {
	return function* (context) {
		yield* input(context).map((v) => v.data);
	};
}

export function changePermutations<
	const T extends PermutationGenerator<object>,
	const U extends PermutationGenerator<object>,
>(input: T, second?: U): PermutationGenerator<object> {
	return function* (context) {
		let i = 0;
		for (const before of input(context)) {
			let j = 0;
			if (second) {
				for (const after of second(context)) {
					yield { before, after, changes: compare(before, after) };
					j++;
				}
			} else {
				for (const after of input(context)) {
					if (i === j) continue;
					yield { before, after, changes: compare(before, after) };
					j++;
				}
			}
			i++;
		}
	};
}
