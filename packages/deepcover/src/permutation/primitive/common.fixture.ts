import type { PermutationGenerator } from '#src/permutation/definitions';

export type Base<T = unknown> = {
	name: string;
	input: unknown;
	primitive: boolean;
	output: readonly T[];
	primitivePaths: readonly string[];
	paths: readonly string[];
	generator: PermutationGenerator;
};

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
