import type { PermutationGenerator } from '#src/permutation/definitions';
import type { Clean } from '#src/permutation/modifiers/clean.types';
import { checkPermutationType } from '#src/permutation/primitive/check-permutation-type';
import type { Never } from '#src/permutation/primitive/never.types';

export function clean(input: Never): Never;
export function clean<const T extends PermutationGenerator>(input: AsClean<T>): T;
export function clean<const T extends PermutationGenerator>(input: T): Clean<T>;
export function clean(input: PermutationGenerator): Clean {
	if (checkPermutationType(input, 'never') || isClean(input)) return input;
	return Object.assign(Object.create(null), {
		*[Symbol.iterator]() {
			yield* input;
		},
		get size() {
			return input.size;
		},
		get modifiers() {
			return [] as readonly never[];
		},
		get originalInputArg() {
			return input.originalInputArg;
		},
		get type() {
			return input.type;
		},
		get structure() {
			return input.structure;
		},
		get permutationPaths() {
			return input.permutationPaths;
		},
		get primitivePermutationPaths() {
			return input.primitivePermutationPaths;
		},
		extract(paths) {
			return clean(input.extract(paths));
		},
		exclude(paths) {
			return clean(input.exclude(paths));
		},
		generatorAt(path) {
			return input.generatorAt(path);
		},
		override(v) {
			return input.override(v);
		},
	} satisfies Clean);
}

export function isClean(v: PermutationGenerator): v is Clean {
	return v.modifiers.length === 0;
}

export type AsClean<T extends PermutationGenerator> = [T['modifiers'][number]] extends [never]
	? T
	: never;
