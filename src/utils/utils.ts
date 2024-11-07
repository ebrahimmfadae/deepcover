import { REMOVE } from '#src/permutation/symbols';
import type { Permutation2 } from '#src/types/permutation.type';

export function isPOJO(obj: unknown): obj is Record<string, unknown> {
	if (obj === null || typeof obj !== 'object') return false;
	const prototype = Object.getPrototypeOf(obj);
	return prototype === Object.prototype || prototype === null;
}

export function typeSafeIsArray<T>(arr: T): arr is Extract<T, readonly unknown[]> {
	return Array.isArray(arr);
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

export function idempotentFreeze<const T>(value: T) {
	return Object.isFrozen(value) ? value : Object.freeze(value);
}

export function convertToSchema<const T extends Permutation2>(permutation: T) {
	const { [Symbol.iterator]: _, ...schema } = permutation;
	return {
		...(schema.context !== undefined && { context: schema.context }),
		type: schema.type,
		schema: schema.schema,
		size: schema.size,
		passive: schema.passive as T['passive'],
	} satisfies Omit<Permutation2, typeof Symbol.iterator | 'allRoutes'>;
}

export function getPassiveSchemas(
	permutation: object | Omit<Permutation2, typeof Symbol.iterator>,
): Omit<Permutation2, typeof Symbol.iterator>[] {
	if (!('type' in permutation)) return [];
	if (!isPOJO(permutation.schema) || !permutation.passive) return [];
	return [permutation, ...getPassiveSchemas(permutation.schema)];
}
