import { explicitPermutations, permutations } from '#src/permutation/pure';
import { NO_ROUTE } from '#src/permutation/symbols';
import type { Multiply } from '#src/types/arithmetic/multiply.type';
import type { Subtract } from '#src/types/arithmetic/subtract.type';
import type { DeepMergeUnion } from '#src/types/merge.type';
import type {
	Permutation2,
	PermutationContext,
	PermutationGenerator2,
} from '#src/types/permutation.type';
import { type ChangeResult, constructChangeObject } from '#src/utils/compare/compare';

export function changePermutations<
	const T extends Permutation2,
	const U extends Permutation2,
	const R = unknown extends U ? ChangeResult<T> : ChangeResult<T, DeepMergeUnion<T | U>>,
>(input: PermutationGenerator2<T>, second?: PermutationGenerator2<U>) {
	return function <const C extends PermutationContext>(context?: C) {
		const r0 = input(context);
		const r1 = second?.(context);
		const size = r0.size * (r1?.size ?? r0.size - 1);
		type S = Permutation2 extends U
			? Multiply<T['size'], Subtract<T['size'], 1>>
			: Multiply<T['size'], U['size']>;
		return {
			...(context !== undefined && { context }),
			schema: {
				input: r0,
				...(r1 ? { second: r1 } : undefined),
			},
			size: size as S,
			type: 'changePermutations',
			// TODO: Collapsing a route array should be in `seal` function
			allRoutes: [{ routes: NO_ROUTE, size }],
			passive: false,
			*[Symbol.iterator]() {
				if (!second)
					yield* permutations(r0, { size: 2, exclusive: true }).map(
						([before, after]) => constructChangeObject(before, after) as R,
					);
				else
					yield* explicitPermutations([r0, r1!]).map(
						([before, after]) => constructChangeObject(before, after) as R,
					);
			},
		} as const;
	} satisfies PermutationGenerator2;
}
