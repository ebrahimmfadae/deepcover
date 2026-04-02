import type { Never } from '#src/permutation/primitive/never.types';
import { merge } from '#src/permutation/utils';

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
		return [] as readonly [];
	},
	get primitivePermutationPaths() {
		return [] as readonly [];
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
	override(v) {
		return merge(this, v);
	},
} satisfies Never;

const singleton = Object.freeze(Object.assign(Object.create(null), n));
