import type { Expandable, IsExpandable } from '#src/types/common.type';

export function isPOJO<const T>(value: T): value is Extract<T, Readonly<Record<string, unknown>>> {
	if (value === null || typeof value !== 'object') return false;
	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
}

export function isExpandable<const T>(value: T | Expandable): value is Extract<T, Expandable> {
	return isPOJO(value) || Array.isArray(value);
}

export function isNotExpandable<const T>(value: T): value is Exclude<T, Expandable> {
	return !isExpandable(value);
}

export function expandableCheck<const T>(value: T) {
	const result = { expandable: isExpandable(value), value };
	return result as T extends unknown
		? IsExpandable<T> extends true
			? { readonly expandable: true; readonly value: Extract<T, Expandable> }
			: { readonly expandable: false; readonly value: Exclude<T, Expandable> }
		: never;
}
