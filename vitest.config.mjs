import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		root: './',
		hookTimeout: 60000,
		testTimeout: 30000,
		hideSkippedTests: false,
		chaiConfig: { truncateThreshold: 120 },
		slowTestThreshold: 0,
		logHeapUsage: true,
		open: false,
		include: ['**/*.{test,spec,bench}.?(c|m)[jt]s?(x)'],
		typecheck: {
			enabled: true,
			include: ['**/*.{test-d,spec-d}.?(c|m)[jt]s?(x)'],
		},
		reporters: 'verbose',
	},
	resolve: {
		alias: {
			'#src': new URL('./src/', import.meta.url).pathname,
			'#test': new URL('./test/', import.meta.url).pathname,
		},
	},
	plugins: [swc.vite()],
});
