export type TupleToUnion<T extends readonly unknown[]> = T[number];
export type PlainType<T> = T extends infer P ? P : never;
export type PartialRecord<K extends PropertyKey, T> = Partial<Record<K, T>>;
export type ExpandableArray<T> = T extends readonly unknown[] ? true : false;
export type ExpandableObject<T> = T extends Record<string | number, unknown> ? true : false;
export type Expandable<T> = ExpandableArray<T> extends true ? true : ExpandableObject<T>;
export type Primitive = string | number | bigint | boolean | null | undefined;
export type ToPrimitive<T> = T extends number
	? number
	: T extends string
		? string
		: T extends boolean
			? boolean
			: T extends bigint
				? bigint
				: T extends null
					? null
					: T extends undefined
						? undefined
						: never;
export type Length<T extends readonly unknown[]> = T extends { length: infer L } ? L : never;
export type CastAsNumericArray<T> = T extends number[] ? T : never;
