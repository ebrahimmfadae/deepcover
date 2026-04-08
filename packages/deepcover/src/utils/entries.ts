import type { Primitive } from '#src/utils/common';
import {
	isExpandableArray,
	isExpandableObject,
	type Expandable,
} from '#src/utils/expandable-check';

export function hasKey<T extends Expandable>(o: T, k?: PropertyKey): k is keyof T {
	if (k === undefined) return false;
	return k in o;
}

/**
 * The function parameter is a tuple to support empty merge.
 *
 * Example: Merging `[ 1, <1 empty item> ]` should return `1`, not `undefined`.
 */
export function mergeTwoObjects(): [];
export function mergeTwoObjects<const T>(v: readonly [T]): [T];
export function mergeTwoObjects<const T>(v: readonly [T?]): [T?];
export function mergeTwoObjects<const T, const U extends Primitive>(v: readonly [T, U]): [U];
export function mergeTwoObjects<const T, const U>(v: readonly [T, U?]): [T] | [U?];
export function mergeTwoObjects<const T, const U>(v: readonly [T?, U?]): [(T | U)?];
export function mergeTwoObjects<const T, const U>(v: readonly [T, U]): [T | U];
export function mergeTwoObjects(v?: readonly [unknown?, unknown?]): [unknown?] {
	if (!v) return new Array(1) as [never];
	if (!(0 in v) && !(1 in v)) return new Array(1) as [never];
	const [a, b] = v;
	if (!(1 in v)) return [a];
	if (!(0 in v)) return [b];
	if (isExpandableArray(a) && isExpandableArray(b)) {
		const size = Math.max(a.length, b.length);
		const arr = new Array(size);
		for (let i = 0; i < size; i++) {
			if (i in a && i in b) arr[i] = mergeTwoObjects([a[i], b[i]]);
			else if (i in b) arr[i] = b[i];
			else if (i in a) arr[i] = a[i];
		}
		return [arr];
	}
	if (isExpandableObject(a) && isExpandableObject(b)) {
		const entries = Object.entries(b).map(([k, v]) => {
			if (hasKey(a, k)) return [k, mergeTwoObjects([a[k], v])] as const;
			return [k, v] as const;
		});
		return [Object.fromEntries(entries)];
	}
	return [b];
}
