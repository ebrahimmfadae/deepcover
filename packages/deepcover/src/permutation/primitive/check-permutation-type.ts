import type { PermutationGenerator, Structure } from '#src/permutation/definitions';
import type { Each } from '#src/permutation/primitive/each.types';
import type { Never } from '#src/permutation/primitive/never.types';
import type { RecordArray } from '#src/permutation/primitive/record-array.types';
import type { RecordPojo } from '#src/permutation/primitive/record-pojo.types';
import type { MyRecord } from '#src/permutation/primitive/record.types';
import type { Seal } from '#src/permutation/primitive/seal.types';
import type { Series } from '#src/permutation/primitive/series.types';

export function checkPermutationType(
	v: PermutationGenerator,
	type: 'series',
	structure?: Structure,
): v is Series;
export function checkPermutationType(
	v: PermutationGenerator,
	type: 'record',
	structure: 'array',
): v is RecordArray;
export function checkPermutationType(
	v: PermutationGenerator,
	type: 'record',
	structure: 'pojo',
): v is RecordPojo;
export function checkPermutationType(v: PermutationGenerator, type: 'record'): v is MyRecord;
export function checkPermutationType(v: PermutationGenerator, type: 'seal'): v is Seal;
export function checkPermutationType(v: PermutationGenerator, type: 'each'): v is Each;
export function checkPermutationType(v: PermutationGenerator, type: 'never'): v is Never;
export function checkPermutationType(
	v: PermutationGenerator,
	type: string,
	structure?: Structure,
): boolean {
	return structure === undefined ? v.type === type : v.type === type && v.structure === structure;
}
