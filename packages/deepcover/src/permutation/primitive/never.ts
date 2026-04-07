import type { Never } from '#src/permutation/primitive/never.types';

export function never(): Never {
	return singleton;
}

const n = {
	*[Symbol.iterator]() {},
	get size() {
		return 0n as const;
	},
	get modifiers() {
		return [];
	},
	get type() {
		return 'never' as const;
	},
	get structure() {
		return 'primitive' as const;
	},
	get permutationPaths() {
		return [] as const;
	},
	get primitivePermutationPaths() {
		return [] as const;
	},
	extract() {
		return this;
	},
	exclude() {
		return this;
	},
	generatorAt() {
		return this;
	},
	subSchemaOf() {
		return true;
	},
	merge(v) {
		return v;
	},
	outputMerge(v) {
		return v;
	},
	union() {
		throw new Error('Not yet implemented');
	},
} satisfies Never;

const singleton = Object.freeze(Object.assign(Object.create(null), n));
