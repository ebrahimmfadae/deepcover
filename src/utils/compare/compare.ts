import { isPOJO } from '#src/utils/utils';

export type CompareResult<T> = {
	key: T;
	state: `unchanged` | `changed` | `created` | `deleted`;
	value: unknown;
	changedTo?: unknown;
};

export function compare<T, E>(a: T, b: T | E, prefix?: string) {
	const changes: CompareResult<string>[] = [];
	if (typeof a !== typeof b) {
		changes.push({ key: prefix ? prefix : '/', state: 'changed', value: a, changedTo: b });
		return changes;
	}
	if (isPOJO(a) && isPOJO(b)) {
		const allKeys = Object.keys(a).concat(Object.keys(b));
		Array.from(new Set(allKeys)).forEach((key) => {
			const fullKey = prefix ? `${prefix}.${key}` : key;
			if (
				(isPOJO(a[key]) && isPOJO(b[key])) ||
				(Array.isArray(a[key]) && Array.isArray(b[key]))
			) {
				changes.push(...compare(a[key], b[key], fullKey));
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
	}
	if (Array.isArray(a) && Array.isArray(b)) {
		for (let i = 0; i < Math.max(a.length, b.length); i++)
			changes.push(...compare(a[i], b[i], `${prefix}.${i}`));
		return changes;
	}
	if (a !== b) {
		changes.push({ key: prefix ? prefix : '/', state: 'changed', value: a, changedTo: b });
		return changes;
	}
	return changes;
}
