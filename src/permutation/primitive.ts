import { REMOVE } from '#src/permutation/symbols';
import type {
	ObjectGenerator,
	PermutationGenerator,
	TupleRemap,
} from '#src/types/permutation.type';
import type { TupleToUnion } from '#src/types/common.type';
import { cachedGenerator, isPOJO } from '#src/utils/utils';

export function one<const T>(value: T): PermutationGenerator<T> {
	return function* () {
		yield value;
	};
}

export function enums<const T extends unknown[]>(enums: T): PermutationGenerator<TupleToUnion<T>> {
	return function* (context) {
		for (const value of enums) {
			if (isPOJO(value) || context?.excludeKeys.every((v) => !v.startsWith(context.route)))
				yield value;
		}
	};
}

export function defer<const T>(value: PermutationGenerator<T>): PermutationGenerator<Generator<T>> {
	return function* (context) {
		yield value(context);
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

export function max<const T>(
	generator: PermutationGenerator<T>,
	max: number,
): PermutationGenerator<T> {
	return function* (context) {
		yield* generator(context).take(max);
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

export function uuid(): PermutationGenerator<`${string}-${string}-${string}-${string}-${string}`> {
	return function* () {
		while (true) {
			yield crypto.randomUUID();
		}
	};
}

export function index(start = 0, end = Infinity) {
	return function* () {
		for (let i = start; i < end; i++) yield i;
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
					if (!context.preserveRemoves && value === REMOVE)
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
							!context.preserveRemoves && value === REMOVE
								? {}
								: ({ [pivotKey]: value } as ObjectGenerator<T>);
						yield Object.assign({}, p, subPermutation) as ObjectGenerator<T>;
					}
				}
			}
		}
	};
}

export function concat<
	const U extends PermutationGenerator[],
	K = U[number] extends PermutationGenerator<infer T> ? T : never,
>(...generators: U): PermutationGenerator<K> {
	return function* (context) {
		for (const g of generators) yield* g(context) as Generator<K>;
	};
}
