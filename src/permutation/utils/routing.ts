import { NO_ROUTE } from '#src/permutation/symbols';

export function squashNoRoutes<
	const T extends readonly { routes: readonly string[] | typeof NO_ROUTE; size: number }[],
>(input: T): readonly { routes: readonly string[] | typeof NO_ROUTE; size: number }[] {
	const notExistingRoutes = input.filter((v) => v.routes === NO_ROUTE);
	if (notExistingRoutes.length === 0) return input;
	const existedRoutes = input.filter((v) => v.routes !== NO_ROUTE);
	const noRouteSizes = notExistingRoutes.map((v) => v.size).reduce((acc, curr) => acc + curr, 0);
	return [{ routes: NO_ROUTE, size: noRouteSizes }, ...existedRoutes];
}
