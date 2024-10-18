export type TupleToUnion<T extends unknown[]> = T[number];
export type PlainType<T> = T extends infer P ? P : never;
export type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>;
export type Expandable<T> = T extends Record<string, unknown> ? T : void;
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
