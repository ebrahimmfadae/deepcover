export function cachedGenerator<T extends Generator>(generator: T) {
	const cache: any[] = [];
	return function* () {
		let currentIndex = 0;
		while (true) {
			if (currentIndex >= cache.length) {
				const { value, done } = generator.next();
				if (done) return value;
				cache.push(value);
			}
			yield cache[currentIndex++];
		}
	} as () => T;
}

export function isPOJO(obj: unknown): obj is Record<string, any> {
	if (obj === null || typeof obj !== 'object') return false;
	const prototype = Object.getPrototypeOf(obj);
	return prototype === Object.prototype || prototype === null;
}

export function typeSafeIsArray<T>(arr: T | T[]): arr is T[] {
	return Array.isArray(arr);
}

export class Atom<T> {
	constructor(public value: T) {}
}

export function deepMerge(target: any, source: any) {
	if (source instanceof Atom) return source.value;
	if (target instanceof Atom) return source;
	if (typeof target !== typeof source) return source;
	if (isPOJO(target) && isPOJO(source)) {
		const ret = { ...target };
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

export function routes(o: Record<string, any>, route = ''): string[] {
	return Object.keys(o).flatMap((k) => {
		const fullKey = route ? `${route}.${k}` : k;
		return isPOJO(o[k]) ? routes(o[k], fullKey) : [fullKey];
	});
}

export function cleanRemoveValues<const T>(input: T): T {
	return JSON.parse(JSON.stringify(input));
}
