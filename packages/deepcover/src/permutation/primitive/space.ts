import type { PermutationGenerator } from '#src/permutation/definitions';
import { each } from '#src/permutation/primitive/each';
import type { Space, SpacePatch } from '#src/permutation/primitive/space.types';
import { merge } from '#src/permutation/utils';

export function space(): Space {
	return Object.assign(function* () {}, {
		get size() {
			return 0n as const;
		},
		get modifiers() {
			return [] as readonly never[];
		},
		get type() {
			return 'space' as const;
		},
		get structure() {
			return 'primitive' as const;
		},
		get permutationPaths() {
			return [] as readonly never[];
		},
		get primitivePermutationPaths() {
			return [] as readonly never[];
		},
		extract() {
			return each();
		},
		exclude() {
			return each();
		},
		generatorAt() {
			return each();
		},
		override(v) {
			return merge(this, v);
		},
	} satisfies SpacePatch & ThisType<Space>);
}

export function isSpace(v: PermutationGenerator): v is Space {
	return v.type === 'space';
}
