import type { PermutationGenerator } from '#src/permutation/definitions';
import { each } from '#src/permutation/exports';
import { merge } from '#src/permutation/utils';

export type SpaceGenerator = () => Iterable<never>;

export type SpacePatch = {
	readonly size: 0;
	readonly modifiers: [];
	readonly originalInputArg: undefined;
	readonly type: 'space';
	readonly structure: 'primitive';
	readonly permutationPaths: [];
	readonly primitivePermutationPaths: [];
	extract: () => PermutationGenerator;
	exclude: () => PermutationGenerator;
	generatorAt: () => PermutationGenerator;
	override: (v: PermutationGenerator) => PermutationGenerator;
};

export function space(): SpaceGenerator & SpacePatch {
	return Object.assign(function* () {} as SpaceGenerator, {
		get size() {
			return 0 as const;
		},
		get modifiers() {
			return [] as [];
		},
		get originalInputArg() {
			return undefined;
		},
		get type() {
			return 'space' as const;
		},
		get structure() {
			return 'primitive' as const;
		},
		get permutationPaths() {
			return [] as [];
		},
		get primitivePermutationPaths() {
			return [] as [];
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
	} satisfies SpacePatch & ThisType<SpaceGenerator & SpacePatch>) as SpaceGenerator & SpacePatch;
}

export function isSpace(v: PermutationGenerator): v is SpaceGenerator & SpacePatch {
	return v.type === 'space';
}
