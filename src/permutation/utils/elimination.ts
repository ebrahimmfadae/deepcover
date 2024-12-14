import { REMOVE } from '#src/permutation/symbols';
import type { Expandable, TupleToUnion } from '#src/types/common.type';
import type { PermutationContext } from '#src/types/permutation.type';
import {
	type EliminateKeysFromExpandable,
	deepEliminateKeys,
} from '#src/utils/entries/elimination';
import { isPOJO } from '#src/utils/type-check';

export type CoalesceString<T, U extends string> = T extends string ? T : U;
export type CoalesceRoutes<T extends readonly string[] | undefined> = CoalesceString<
	TupleToUnion<T extends readonly string[] ? T : never[]>,
	''
>;
export type PartialEliminateExpandable<T, C extends PermutationContext> = T extends Expandable
	? C['route'] extends CoalesceRoutes<C['removeRoutes']>
		? REMOVE
		: EliminateKeysFromExpandable<T, CoalesceRoutes<C['removeRoutes']>>
	: C['route'] extends CoalesceRoutes<C['removeRoutes']>
		? REMOVE
		: T;

export function partialEliminateExpandable<const T, const C extends PermutationContext>(
	input: T,
	context?: C,
): PartialEliminateExpandable<T, C> {
	if (!context || !context.removeRoutes) return input as PartialEliminateExpandable<T, C>;
	const currentRoute = context.route ?? '';
	const startMatches = context.removeRoutes.filter((v) => v.startsWith(currentRoute));
	const isRouteExcluded = startMatches.length > 0;
	if (!isRouteExcluded) return input as PartialEliminateExpandable<T, C>;
	const exactMatch = context.removeRoutes.some((v) => v === currentRoute);
	if (exactMatch || (!isPOJO(input) && !Array.isArray(input)))
		return REMOVE as PartialEliminateExpandable<T, C>;
	const objectOrArrayRoutePrefix = new RegExp(`${currentRoute}\\.?`, 'g');
	const removeRoutePrefixes = startMatches.map((v) => v.replaceAll(objectOrArrayRoutePrefix, ''));
	// TODO: The below requirement is not necessary
	//		If there is no exact match in deep entries, return REMOVE
	//	It should be commented descriptively
	return deepEliminateKeys(input, removeRoutePrefixes) as PartialEliminateExpandable<T, C>;
}
