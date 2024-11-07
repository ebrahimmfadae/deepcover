import { required } from '#src/permutation/primitive/required';
import { combinations, explicitPermutations } from '#src/permutation/pure';
import { NO_ROUTE, type REMOVE } from '#src/permutation/symbols';
import type { MultiplyTuple } from '#src/types/arithmetic/multiply.type';
import type { Sum } from '#src/types/arithmetic/sum.type';
import type { SquashObjectUnion } from '#src/types/merge.type';
import type {
	Permutation2,
	PermutationContext,
	PermutationGenerator2,
} from '#src/types/permutation.type';
import {
	type Entries,
	typeSafeEntries,
	typeSafeFromEntries,
	type UnionToTuple,
} from '#src/utils/entries';
import { convertToSchema } from '#src/utils/utils';

export function combination<
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
