import type { Expandable } from '#src/types/common.type';
import type { UnionToIntersection } from '#src/types/merge.type';

export function cachedGenerator<T extends Generator>(generator: T) {
	const cache: unknown[] = [];
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

export function isPOJO(obj: unknown): obj is Record<PropertyKey, unknown> {
	if (obj === null || typeof obj !== 'object') return false;
	const prototype = Object.getPrototypeOf(obj);
	return prototype === Object.prototype || prototype === null;
}

export function typeSafeIsArray<T>(arr: T | T[]): arr is T[] {
	return Array.isArray(arr);
}

export function deepMerge<T, S>(target: T, source: S) {
	if (typeof target !== typeof source) return source;
	if (isPOJO(target) && isPOJO(source)) {
		const ret: Record<PropertyKey, unknown> = { ...target };
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

type ConcatKey<Prefix extends string, K extends string> = Prefix extends '' ? K : `${Prefix}.${K}`;

type DeepEntries<T, P extends string = ''> = T extends unknown
	? Expandable<T> extends true
		? { [K in keyof T]: DeepEntries<T[K], ConcatKey<P, K & string>> }[keyof T]
		: [P, T]
	: never;

export function deepEntries<const T extends Record<string, unknown>>(
	o: T,
	route = '',
): DeepEntries<T>[] {
	return Object.keys(o).flatMap((k) => {
		const fullKey = route ? `${route}.${k}` : k;
		return isPOJO(o[k]) ? deepEntries(o[k], fullKey) : ([[fullKey, o[k]]] as DeepEntries<T>[]);
	}) as DeepEntries<T>[];
}

type EntryToObject<T extends [string, unknown]> = T extends [infer K extends string, infer V]
	? { [key in K]: V }
	: never;

type FromEntries<T extends [string, unknown][]> = UnionToIntersection<
	T[number] extends infer U ? (U extends [string, unknown] ? EntryToObject<U> : never) : never
>;

export type DeepFlatKeys<T> =
	T extends Record<string, unknown> ? keyof FromEntries<DeepEntries<T>[]> : never;

export function typeSafeFromEntries<const T extends [string, unknown][]>(
	entries: T,
): FromEntries<T> {
	return Object.fromEntries(entries) as FromEntries<T>;
}

export function cleanRemoveValues<const T>(input: T): T {
	return JSON.parse(JSON.stringify(input));
}
