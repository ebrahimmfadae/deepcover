export type TupleToUnion<T extends readonly unknown[]> = T[number];
export type PlainType<T> = T extends infer P ? P : never;
export type PartialRecord<K extends PropertyKey, T> = Partial<Record<K, T>>;
export type IsExpandableArray<T> = T extends readonly unknown[] ? true : false;
export type IsExpandableObject<T> = T extends Record<string, unknown> ? true : false;
export type Expandable = Record<string, unknown> | readonly unknown[];
export type IsExpandable<T> = T extends Expandable ? true : false;
export type AsExpandable<T> = T extends Expandable ? T : never;
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
export type Length<T extends readonly unknown[]> = T extends { length: infer L extends number }
	? L
	: never;
export type CastAsNumericArray<T> = T extends readonly number[] ? T : never;
