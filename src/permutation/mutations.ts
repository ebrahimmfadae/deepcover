import { object, one, optional } from '#src/permutation/primitive';
import type { DeepMergeUnion, HardMerge } from '#src/types/merge.type';
import type {
	GeneratorReturnType,
	ObjectGenerator,
	PermutationGenerator,
} from '#src/types/permutation.type';
import { compare, type CompareResult } from '#src/utils/compare/compare';
import { cleanRemoveValues, deepEntries, deepMerge, type DeepFlatKeys } from '#src/utils/utils';

export function append<
	const T extends Record<string, unknown>,
	U extends PermutationGenerator<Record<string, unknown>>,
>(
	input: PermutationGenerator<T>,
	permute: (permutation: T) => U,
): PermutationGenerator<DeepMergeUnion<HardMerge<T, GeneratorReturnType<U>>>> {
	return function* (context) {
		for (const v of input(context)) {
			for (const u of permute(v)(context)) {
				yield { ...v, ...u } as DeepMergeUnion<HardMerge<T, GeneratorReturnType<U>>>;
			}
		}
	};
}

export function appendInfinite<
	const T extends Record<string, unknown>,
	U extends PermutationGenerator<Record<string, unknown>>,
	R = HardMerge<T, GeneratorReturnType<U>>,
>(input: PermutationGenerator<T>, permute: U): PermutationGenerator<R> {
	return function* (context) {
		const g = input(context);
		const p = permute(context);
		for (const v of g) {
			const { done, value } = p.next();
			if (done) throw Error('Illegal state');
			yield { ...v, ...value } as R;
		}
	};
}

export function combinations<const T extends Record<string, PermutationGenerator>>(
	input: T,
): PermutationGenerator<ObjectGenerator<T>> {
	const e = Object.entries(input).map(([k, v]) => [k, optional(v)]);
	const m = Object.fromEntries(e) as T;
	return function* (context) {
		yield* object(m)(context);
	};
}

export function mutate<const T, const U extends Record<string, unknown>>(
	base: PermutationGenerator<T>,
	mutation: PermutationGenerator<U>,
): PermutationGenerator<ChangeResult<T, DeepMergeUnion<T | U>>> {
	return function* (context) {
		for (const a of mutation({
			excludeKeys: [],
			preserveRemoves: true,
			route: '',
		})) {
			const mutationKeys = deepEntries(a);
			if (mutationKeys.length === 0) continue;
			for (const before of base({
				excludeKeys: mutationKeys.map((v) => v[0]),
				preserveRemoves: false,
				route: '',
			})) {
				const after = cleanRemoveValues(deepMerge(before, a));
				yield {
					before,
					after,
					changes: compare(before, after),
				};
			}
		}
	} as PermutationGenerator<ChangeResult<T, DeepMergeUnion<T | U>>>;
}

type ChangeResult<T, U> = {
	before: T;
	after: U;
	changes: CompareResult<DeepFlatKeys<U>>[];
};

export function changePermutations<const T, const U>(
	input: PermutationGenerator<T>,
	second?: PermutationGenerator<U>,
): typeof second extends PermutationGenerator
	? PermutationGenerator<ChangeResult<T, DeepMergeUnion<T | U>>>
	: PermutationGenerator<ChangeResult<T, U>> {
	return function* (context) {
		let i = 0;
		for (const before of input(context)) {
			if (second) {
				for (const after of second(context))
					yield {
						before,
						after,
						changes: compare(before, after),
					};
			} else {
				let j = 0;
				for (const after of input(context)) {
					if (i === j) continue;
					yield {
						before,
						after,
						changes: compare(before, after),
					};
					j++;
				}
			}
			i++;
		}
	} as typeof second extends PermutationGenerator
		? PermutationGenerator<ChangeResult<T, DeepMergeUnion<T | U>>>
		: PermutationGenerator<ChangeResult<T, U>>;
}

export function deferredChangePermutations<const T, const U>(
	input: PermutationGenerator<T>,
	second: PermutationGenerator<U>,
) {
	return function* (context) {
		for (const before of input(context)) {
			yield {
				before,
				deferred: changePermutations(one(before), second)(context),
			};
		}
	} satisfies PermutationGenerator;
}
