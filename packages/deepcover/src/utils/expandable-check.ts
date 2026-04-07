export type ExpandableArray<T = unknown> = readonly T[];
export type ExpandableObject<T = unknown> = Readonly<Record<string, T>>;
export type Expandable<T = unknown> = ExpandableObject<T> | ExpandableArray<T>;

export function isExpandableObject(value: unknown): value is ExpandableObject {
	if (value === null || typeof value !== 'object') return false;
	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
}

export function isExpandableArray(value: unknown): value is ExpandableArray {
	return Array.isArray(value);
}

export function isExpandable(value: unknown): value is Expandable {
	return isExpandableObject(value) || isExpandableArray(value);
}
