import { REMOVE } from "#src/permutation/symbols";
import type { PermutationContext } from "#src/types/permutation.type";
import { deepEliminateKeys } from "#src/utils/elimination";
import { isPOJO } from "#src/utils/utils";

export function handlePlainObjectOrArrayElimination<const T, const C extends PermutationContext>(
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
	const objectOrArrayRoutePrefix = new RegExp(`${currentRoute}\\.?`, 'g');
	const removeRoutePrefixes = startMatches.map((v) => v.replaceAll(objectOrArrayRoutePrefix, ''));
	// TODO: The below requirement is not necessary
	//		If there is no exact match in deep entries, return REMOVE
	//	It should be commented descriptively
	return deepEliminateKeys(input, removeRoutePrefixes);
}
