import type { Permutation2, PermutationContext } from '#src/types/permutation.type';
import { isPOJO } from '#src/utils/type-check';

export function convertToSchema<const T extends Permutation2>(permutation: T) {
	const { [Symbol.iterator]: _, ...schema } = permutation;
	return {
		...(schema.context !== undefined && { context: schema.context }),
		type: schema.type,
		schema: schema.schema,
		size: schema.size,
		passive: schema.passive,
	} as PermutationContext extends T['context']
		? {
				schema: T['schema'];
				size: T['size'];
				type: T['type'];
				passive: T['passive'];
			}
		: {
				context: T['context'];
				schema: T['schema'];
				size: T['size'];
				type: T['type'];
				passive: T['passive'];
			};
}

export function getPassiveSchemas(
	permutation: object | Omit<Permutation2, typeof Symbol.iterator>,
): Omit<Permutation2, typeof Symbol.iterator>[] {
	if (!('type' in permutation)) return [];
	if (!isPOJO(permutation.schema) || !permutation.passive) return [];
	return [permutation, ...getPassiveSchemas(permutation.schema)];
}
