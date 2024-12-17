export function freezeOnce<const T>(value: T): Readonly<T> {
	return Object.isFrozen(value) ? value : Object.freeze(value);
}
