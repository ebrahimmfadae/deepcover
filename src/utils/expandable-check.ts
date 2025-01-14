export type ExpandableArray = readonly unknown[];
export type ExpandableObject = Readonly<Record<string, unknown>>;
export type IsExpandableArray<T> = T extends ExpandableArray ? true : false;
export type IsExpandableObject<T> = T extends ExpandableObject ? true : false;
export type Expandable = ExpandableObject | ExpandableArray;
export type IsExpandable<T> = T extends Expandable ? true : false;
export type AsExpandable<T> = T extends Expandable ? T : never;

export function isExpandableObject<T>(value: T): value is Extract<T, ExpandableObject> {
	if (value === null || typeof value !== 'object') return false;
	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
}

export function isExpandableArray<T>(value: T): value is Extract<T, ExpandableArray> {
	return Array.isArray(value);
}

export function isExpandable<T>(value: T | Expandable): value is Extract<T, Expandable> {
	return isExpandableObject(value) || isExpandableArray(value);
}

export function isNotExpandable<T>(value: T): value is Exclude<T, Expandable> {
	return !isExpandable(value);
}

// export function expandableCheck<const T>(value: T) {
// 	const result = { expandable: isExpandable(value), value };
// 	return result as T extends unknown
// 		? IsExpandable<T> extends true
// 			? { readonly expandable: true; readonly value: Extract<T, Expandable> }
// 			: { readonly expandable: false; readonly value: Exclude<T, Expandable> }
// 		: never;
// }
