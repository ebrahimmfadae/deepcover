// TODO: Written by AI. Needs cleanup
export function removeEntryByPath<T>(object: T, path: string): T {
	const keys = path.split('.');
	const [first, ...rest] = keys;
	if (object == null || typeof object !== 'object') return object;
	const copy = (Array.isArray(object) ? [...object] : { ...object }) as T;
	if (rest.length === 0) {
		if (Array.isArray(copy)) {
			const index = Number(first);
			if (!Number.isNaN(index)) delete copy[index];
		} else {
			delete copy[first];
		}
		return copy;
	}
	copy[first] = removeEntryByPath(copy[first], rest.join('.'));
	return copy;
}
