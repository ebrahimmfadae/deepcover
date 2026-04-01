import type { Expandable } from '#src/utils/expandable-check';

export function hasKey<T extends Expandable>(o: T, k?: PropertyKey): k is keyof T {
	if (k === undefined) return false;
	return k in o;
}
