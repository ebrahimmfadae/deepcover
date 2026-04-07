import type { PermutationGenerator } from '#src/permutation/definitions';
import type { AsOptional, Optional } from '#src/permutation/modifiers/optional.types';
import { checkPermutationType } from '#src/permutation/primitive/check-permutation-type';
import type { Never } from '#src/permutation/primitive/never.types';

/**
 * Optional modifier is only respected in record() which has paths. It has no effect on the
 * standalone permutations.
 */
export function optional(input: Never): Never;
export function optional<const T extends PermutationGenerator>(input: AsOptional<T>): T;
export function optional<const T extends PermutationGenerator>(input: T): Optional<T>;
export function optional(input: PermutationGenerator): Optional | Never {
	if (checkPermutationType(input, 'never') || isOptional(input)) return input;
	return Object.assign(Object.create(null), input, {
		get modifiers() {
			return ['optional', ...input.modifiers];
		},
		extract(paths) {
			return optional(input.extract(paths));
		},
		exclude(paths) {
			return optional(input.exclude(paths));
		},
	} satisfies Partial<Optional>);
}

export function isOptional(v: PermutationGenerator): v is Optional {
	return v.modifiers.includes('optional');
}
