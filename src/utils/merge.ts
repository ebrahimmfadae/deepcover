import { isPOJO } from '#src/utils/type-check';

/**
 * Note: Unmatched types will override by source
 *
 * @param target
 * @param source
 * @returns
 */
export function deepMerge<const T, const S>(target: T, source: S): T | S {
	if (typeof target !== typeof source) return source;
	if (isPOJO(target) && isPOJO(source)) {
		const ret: Record<string, unknown> = { ...target };
		for (const key in source) {
			if (Object.prototype.hasOwnProperty.call(source, key)) {
				ret[key] = deepMerge(target[key], source[key]);
			}
		}
		return ret as T | S;
	}
	if (Array.isArray(target) && Array.isArray(source)) {
		const ret = [...target];
		for (let i = 0; i < source.length; i++) {
			ret[i] = deepMerge(target[i], source[i]);
		}
		return ret as T | S;
	}
	return source;
}
