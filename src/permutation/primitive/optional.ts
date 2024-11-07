import { NO_ROUTE, REMOVE } from '#src/permutation/symbols';
import { squashNoRoutes } from '#src/permutation/utils/routing';
import type { Sum } from '#src/types/arithmetic/sum.type';
import type {
	Permutation2,
	PermutationContext,
	PermutationGenerator2,
} from '#src/types/permutation.type';
import { convertToSchema, getPassiveSchemas } from '#src/utils/utils';

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
