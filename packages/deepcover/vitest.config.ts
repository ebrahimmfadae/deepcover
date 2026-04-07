import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swc from 'unplugin-swc';
import { defineConfig, type ViteUserConfigExport } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: ViteUserConfigExport = defineConfig({
	test: {
		globals: true,
		root: './',
		hookTimeout: 60000,
		testTimeout: 30000,
		hideSkippedTests: false,
		chaiConfig: { truncateThreshold: 120 },
		slowTestThreshold: 0,
		logHeapUsage: false,
		open: false,
		bail: 1,
		include: ['**/*.{test,spec,bench}.?(c|m)[jt]s?(x)'],
		typecheck: {
			enabled: true,
			include: ['**/*.{test-d,spec-d}.?(c|m)[jt]s?(x)'],
		},
		reporters: 'default',
		isolate: false,
		pool: 'threads',
		passWithNoTests: true,
		fileParallelism: false,
		maxConcurrency: 1,
		maxWorkers: 1,
	},
	resolve: {
		alias: {
			'#src': path.resolve(__dirname, 'src/'),
			'#test': path.resolve(__dirname, 'test/'),
		},
	},
	plugins: [swc.vite()],
});

export default config;
