import type { PermutationGenerator } from '#src/permutation/definitions';
import type { Clean } from '#src/permutation/modifiers/clean.types';
import { checkPermutationType } from '#src/permutation/primitive/check-permutation-type';
import type { Never } from '#src/permutation/primitive/never.types';

export function clean(input: Never): Never;
export function clean<const T extends PermutationGenerator>(input: AsClean<T>): T;
export function clean<const T extends PermutationGenerator>(input: T): Clean<T>;
export function clean(input: PermutationGenerator): Clean | Never {
	if (checkPermutationType(input, 'never') || isClean(input)) return input;
	return Object.assign(Object.create(null), input, {
		*[Symbol.iterator]() {
			yield* input;
		},
		get modifiers() {
			return [];
		},
		extract(paths) {
			return clean(input.extract(paths));
		},
		exclude(paths) {
			return clean(input.exclude(paths));
		},
	} satisfies Partial<Clean>);
}

export function isClean(v: PermutationGenerator): v is Clean {
	return v.modifiers.length === 0;
}

export type AsClean<T extends PermutationGenerator> = [T['modifiers'][number]] extends [never]
	? T
	: never;
