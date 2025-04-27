export function hasKey<T extends Readonly<Record<PropertyKey, unknown>> | readonly unknown[]>(
	object: T,
	key?: PropertyKey,
): key is NonNullable<keyof T> {
	if (key === undefined) return false;
	return key in object;
}
