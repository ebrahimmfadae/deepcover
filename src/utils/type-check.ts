import type { Expandable, IsExpandableArray, IsExpandableObject } from '#src/types/common.type';

export function isPOJO<const T>(value: T): value is Extract<T, Record<string, unknown>> {
	if (value === null || typeof value !== 'object') return false;
	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
}

export function typeSafeIsArray<const T>(value: T): value is Extract<T, readonly unknown[]> {
	return Array.isArray(value);
}

export function isExpandable<const T>(value: T): value is Extract<T, Expandable> {
	return isPOJO(value) || typeSafeIsArray(value);
}

export function isNotExpandable<const T>(value: T): value is Exclude<T, Expandable> {
	return !isExpandable(value);
}

export function expandableCheck<const T>(value: T) {
	const result = isExpandable(value) ? { isExpandable: true, value } : { isExpandable: false };
	return result as T extends unknown
		? IsExpandableObject<T> extends true
			? { readonly isExpandable: true; readonly value: Extract<T, Record<string, unknown>> }
			: IsExpandableArray<T> extends true
				? { readonly isExpandable: true; readonly value: Extract<T, readonly unknown[]> }
				: { readonly isExpandable: false; readonly value: T }
		: never;
}
