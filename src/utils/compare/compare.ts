import type { MutableFlatKeys } from '#src/utils/entries/keys';
import { isPOJO, typeSafeIsArray } from '#src/utils/type-check';

export type CompareResult<T> = {
	key: T;
	state: `unchanged` | `changed` | `created` | `deleted`;
	value: unknown;
	changedTo?: unknown;
};

export function compare<T, U>(
	a: T,
	b: T | U,
	prefix?: string,
): CompareResult<MutableFlatKeys<T | U>>[] {
	const changes: CompareResult<MutableFlatKeys<T | U>>[] = [];
	if (typeof a !== typeof b) {
		changes.push({
			key: (prefix ? prefix : '/') as MutableFlatKeys<T | U>,
			state: 'changed',
			value: a,
			changedTo: b,
		});
		return changes;
	}
	if (isPOJO(a) && isPOJO(b)) {
		const allKeys = Object.keys(a).concat(Object.keys(b));
		Array.from(new Set(allKeys)).forEach((key) => {
			const fullKey = (prefix ? `${prefix}.${key}` : key) as MutableFlatKeys<T | U>;
			if (
				(isPOJO(a[key]) && isPOJO(b[key])) ||
				(Array.isArray(a[key]) && Array.isArray(b[key]))
			) {
				changes.push(
					...(compare(a[key], b[key], fullKey) as Iterable<
						CompareResult<MutableFlatKeys<T | U>>
					>),
				);
			} else if (key in a && !(key in b)) {
				changes.push({
					key: fullKey,
					state: `deleted`,
					value: a[key],
				});
			} else if (!(key in a) && key in b) {
				changes.push({
					key: fullKey,
					state: `created`,
					value: b[key],
				});
			} else if (a[key] !== b[key]) {
				changes.push({
					key: fullKey,
					state: `changed`,
					value: a[key],
					changedTo: b[key],
				});
			} else {
				changes.push({
					key: fullKey,
					state: `unchanged`,
					value: a[key],
				});
			}
		});
		return changes;
	} else if (typeSafeIsArray(a) && typeSafeIsArray(b)) {
		for (let i = 0; i < Math.max(a.length, b.length); i++) {
			const fullKey = (prefix ? `${prefix}[${i}]` : i) as MutableFlatKeys<T | U>;
			if ((isPOJO(a[i]) && isPOJO(b[i])) || (Array.isArray(a[i]) && Array.isArray(b[i]))) {
				changes.push(
					...(compare(a[i], b[i], fullKey) as Iterable<
						CompareResult<MutableFlatKeys<T | U>>
					>),
				);
			} else if (i in a && !(i in b)) {
				changes.push({
					key: fullKey,
					state: `deleted`,
					value: a[i],
				});
			} else if (!(i in a) && i in b) {
				changes.push({
					key: fullKey,
					state: `created`,
					value: b[i],
				});
			} else if (a[i] !== b[i]) {
				changes.push({
					key: fullKey,
					state: `changed`,
					value: a[i],
					changedTo: b[i],
				});
			} else {
				changes.push({
					key: fullKey,
					state: `unchanged`,
					value: a[i],
				});
			}
		}
		return changes;
	}
	if (a !== b) {
		changes.push({
			key: (prefix ? prefix : '/') as MutableFlatKeys<T | U>,
			state: 'changed',
			value: a,
			changedTo: b,
		});
		return changes;
	}
	return changes;
}

export type ChangeResult<T, U = T> = {
	before: T;
	after: U;
	changes: CompareResult<MutableFlatKeys<T | U>>[];
};

export function constructChangeObject<const T, const U>(before: T, after: U) {
	return {
		before,
		after,
		changes: compare(before, after),
	} as ChangeResult<T, U>;
}
