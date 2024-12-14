import { REMOVE } from '#src/permutation/symbols';
import { isPOJO, typeSafeIsArray } from '#src/utils/type-check';

// TODO: Convert REMOVE symbols with optional keys
export function cleanRemoveValues<const T>(input: T): T | undefined {
	if (!isPOJO(input) && !typeSafeIsArray(input)) return input === REMOVE ? undefined : input;
	if (typeSafeIsArray(input)) {
		const c = [...input];
		c.forEach((v, i) => {
			if (v === REMOVE) delete c[i];
			else if (isPOJO(c[i]) || Array.isArray(c[i])) c[i] = cleanRemoveValues(c[i]);
		});
		return c as T | undefined;
	} else if (isPOJO(input)) {
		const c: Record<string, unknown> = { ...input };
		for (const key in c) {
			if (Object.prototype.hasOwnProperty.call(c, key)) {
				if (c[key] === REMOVE) delete c[key];
				else if (isPOJO(c[key]) || Array.isArray(c[key]))
					c[key] = cleanRemoveValues(c[key]);
			}
		}
		return c as T | undefined;
	}
	return input;
}
