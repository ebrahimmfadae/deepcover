import { REMOVE } from '#src/permutation/symbols';
import type { Expandable, IsExpandableArray, IsExpandableObject } from '#src/types/common.type';
import type { Permutation2, PermutationContext } from '#src/types/permutation.type';

export function isPOJO(value: unknown): value is Record<string, unknown> {
	if (value === null || typeof value !== 'object') return false;
	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
}

export function typeSafeIsArray<T>(value: T): value is Extract<T, readonly unknown[]> {
	return Array.isArray(value);
}

export function isExpandable<T>(value: T): value is Extract<T, Expandable> {
	return isPOJO(value) || typeSafeIsArray(value);
}

export function isNotExpandable<T>(value: T): value is Exclude<T, Expandable> {
	return !isExpandable(value);
}

export function expandableCheck<T>(value: T) {
	const result = isExpandable(value) ? { isExpandable: true, value } : { isExpandable: false };
	return result as T extends unknown
		? IsExpandableObject<T> extends true
			? { isExpandable: true; value: Extract<T, Record<string, unknown>> }
			: IsExpandableArray<T> extends true
				? { isExpandable: true; value: Extract<T, readonly unknown[]> }
				: { isExpandable: false; value: T }
		: never;
}

export function deepMerge<T, S>(target: T, source: S) {
	if (typeof target !== typeof source) return source;
	if (isPOJO(target) && isPOJO(source)) {
		const ret: Record<string, unknown> = { ...target };
		for (const key in source) {
			if (Object.prototype.hasOwnProperty.call(source, key)) {
				ret[key] = deepMerge(target[key], source[key]);
			}
		}
		return ret;
	}
	if (Array.isArray(target) && Array.isArray(source)) {
		const ret = [...target];
		for (let i = 0; i < source.length; i++) {
			ret[i] = deepMerge(target[i], source[i]);
		}
		return ret;
	}
	return source;
}

export function cleanRemoveValues<const T>(input: T) {
	if (!isPOJO(input) && !typeSafeIsArray(input)) return input === REMOVE ? undefined : input;
	if (typeSafeIsArray(input)) {
		const c = [...input];
		c.forEach((v, i) => {
			if (v === REMOVE) delete c[i];
			else if (isPOJO(c[i]) || Array.isArray(c[i])) c[i] = cleanRemoveValues(c[i]);
		});
		return c;
	} else if (isPOJO(input)) {
		const c: Record<string, unknown> = { ...input };
		for (const key in c) {
			if (Object.prototype.hasOwnProperty.call(c, key)) {
				if (c[key] === REMOVE) delete c[key];
				else if (isPOJO(c[key]) || Array.isArray(c[key]))
					c[key] = cleanRemoveValues(c[key]);
			}
		}
		return c;
	}
	return input;
}

export function idempotentFreeze<const T>(value: T): Readonly<T> {
	return Object.isFrozen(value) ? value : Object.freeze(value);
}

export function convertToSchema<const T extends Permutation2>(permutation: T) {
	const { [Symbol.iterator]: _, ...schema } = permutation;
	return {
		...(schema.context !== undefined && { context: schema.context }),
		type: schema.type,
		schema: schema.schema,
		size: schema.size,
		passive: schema.passive,
	} as PermutationContext extends T['context']
		? {
				schema: T['schema'];
				size: T['size'];
				type: T['type'];
				passive: T['passive'];
			}
		: {
				context: T['context'];
				schema: T['schema'];
				size: T['size'];
				type: T['type'];
				passive: T['passive'];
			};
}

export function getPassiveSchemas(
	permutation: object | Omit<Permutation2, typeof Symbol.iterator>,
): Omit<Permutation2, typeof Symbol.iterator>[] {
	if (!('type' in permutation)) return [];
	if (!isPOJO(permutation.schema) || !permutation.passive) return [];
	return [permutation, ...getPassiveSchemas(permutation.schema)];
}
