export function* iterableWithIndex<const T>(input: Iterable<T>): Iterable<readonly [T, number]> {
	let i = 0;
	for (const element of input) yield [element, i++];
}
