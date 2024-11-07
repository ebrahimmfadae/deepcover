import { NO_ROUTE, REMOVE } from '#src/permutation/symbols';
import { squashNoRoutes } from '#src/permutation/utils/routing';
import type { Subtract } from '#src/types/arithmetic/subtract.type';
import type {
	Permutation2,
	PermutationContext,
	PermutationGenerator2,
} from '#src/types/permutation.type';
import { convertToSchema, getPassiveSchemas } from '#src/utils/utils';

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
