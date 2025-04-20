import type {
	Permutation,
	PermutationGenerator,
	UnwrapPermutation,
} from '#src/permutation/definitions';

export function optional<const T extends Permutation>(input: PermutationGenerator<T>) {
	return function () {
		const r = input();
		if (r.modifiers.includes('optional')) return r;
		return { ...r, modifiers: ['optional', ...r.modifiers] };
	} as PermutationGenerator<
		'optional' extends T['modifiers'][number]
			? T
			: Iterable<UnwrapPermutation<T>> & {
					readonly size: T['size'];
					readonly type: T['type'];
					readonly modifiers: ['optional', ...T['modifiers']];
				}
	>;
}
