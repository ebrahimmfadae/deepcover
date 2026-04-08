import type { PermutationGenerator } from '#src/permutation/definitions';
import { record } from '#src/permutation/primitive/record/record';
import { mergeTwoObjects } from '#src/utils/entries';

export function serializeArgs(e: readonly unknown[]) {
	const s = e.map((v) => {
		if (typeof v === 'symbol') return v.toString();
		if (v instanceof Date) return 'new Date()';
		if (typeof v === 'bigint') return `${v}n`;
		if (v === undefined) return `${v}`;
		return JSON.stringify(v);
	});
	return s.join(',');
}

export function escapePropertyKey(key: string): string {
	return key === '' ? "''" : /^[^a-zA-Z_$]/.test(key) ? `'${key}'` : key;
}

export function generateOutputMerge(a: PermutationGenerator, b: PermutationGenerator) {
	const s = record([a, b]);
	return Iterator.from(s)
		.map((u) => mergeTwoObjects(u))
		.filter((u) => 0 in u)
		.flatMap((u) => u);
}
