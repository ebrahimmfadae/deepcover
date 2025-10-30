import type { PermutationPatch } from '#src/permutation/definitions';

export type SpaceGenerator = () => Iterable<never>;

export interface SpacePatch extends PermutationPatch {
	readonly size: 0n;
	readonly modifiers: readonly never[];
	readonly type: 'space';
	readonly structure: 'primitive';
}

export interface Space extends SpacePatch, SpaceGenerator {}
