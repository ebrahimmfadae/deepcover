import type { PermutationGenerator } from '#src/permutation/definitions';
import { series } from '#src/permutation/primitive/series';
import type { Series } from '#src/permutation/primitive/series.types';
import { combinations } from '#src/permutation/pure/combinations';

export function combo<T extends PermutationGenerator>(
	input: T,
	limits: { max?: number } = {},
): Series {
	const { max = input.primitivePermutationPaths.length } = limits;
	const p = combinations(input.primitivePermutationPaths, { min: 1, max });
	// Eliminate combination of multiple-positions. e.g. #0 and #1 at the same route
	const validIndices = p.filter((v) => {
		const indices = new Set(v.values().flatMap((u) => getSeriesPathHierarchy(u))).values();
		const grouped = Object.groupBy(indices, (u) => u.replace(/#\d+\.$|#\d+/g, '#'));
		const hasConflict = Object.values(grouped)
			.filter((v) => v !== undefined)
			.some((w) => w.length > 1);
		return !hasConflict;
	});
	// NOTE: We don't need to eliminate optional modifier. The reason is that
	//		the result of this function is going to be used/merged as a permutation generator
	return series(...validIndices.map((v) => input.extract([...v])));
}

function getSeriesPathHierarchy(path: string): string[] {
	const matches = path.matchAll(/.*?#\d+\.?/g);
	const initialValue: string[] = [];
	const m = matches.flatMap((v) => v.values()).filter((v) => v !== undefined);
	return m.reduce((p, c, i) => {
		const s = i - 1;
		return p.concat([p.slice(s).concat(c).join('')]);
	}, initialValue);
}
