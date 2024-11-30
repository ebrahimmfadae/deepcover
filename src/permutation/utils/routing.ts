import { NO_ROUTE } from '#src/permutation/symbols';
import type { AllRoute } from '#src/types/permutation.type';

export function squashRoutes<
	const T extends readonly { routes: readonly string[]; size: number }[],
>(input: T): readonly { routes: readonly string[]; size: number }[] {
	const o = Object.groupBy(input, (v) => v.routes.toSorted().join('')) as Record<
		string,
		{ routes: readonly string[]; size: number }[]
	>;
	const o2 = Object.values(o);
	return o2.map((v) =>
		v.reduce((acc, curr) => ({
			routes: acc.routes,
			size: acc.size + curr.size,
		})),
	);
}

export function squashNoRoutes<const T extends readonly AllRoute[]>(input: T): readonly AllRoute[] {
	const notExistingRoutes = input.filter((v) => v.routes === NO_ROUTE);
	if (notExistingRoutes.length === 0) return input;
	const existedRoutes = input.filter((v) => v.routes !== NO_ROUTE) as readonly {
		routes: readonly string[];
		size: number;
	}[];
	const noRouteSizes = notExistingRoutes.map((v) => v.size).reduce((acc, curr) => acc + curr, 0);
	return [{ routes: NO_ROUTE, size: noRouteSizes }, ...squashRoutes(existedRoutes)];
}
