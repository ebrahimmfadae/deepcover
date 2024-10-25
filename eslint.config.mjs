import js from '@eslint/js';
import pluginImport from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
	{ name: 'eslint/recommended', ...js.configs.recommended },
	...tseslint.configs.recommended,
	pluginImport.flatConfigs.recommended,
	{
		name: 'prettier/recommended',
		...eslintPluginPrettierRecommended,
	},
	{ name: 'custom/files', ignores: ['**/dist'] },
	{
		name: 'custom/misc',
		plugins: {
			'@typescript-eslint': tseslint.plugin,
		},
		languageOptions: {
			globals: {
				...globals.node,
			},
			parser: tseslint.parser,
			ecmaVersion: 5,
			sourceType: 'module',
			parserOptions: {
				project: 'tsconfig.json',
				tsconfigRootDir: __dirname,
			},
		},
		rules: {
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/consistent-type-exports': 'error',
			'@typescript-eslint/consistent-type-imports': 'error',
			'@typescript-eslint/no-namespace': 'error',
			'@typescript-eslint/no-extraneous-class': 'error',
			'@typescript-eslint/no-for-in-array': 'error',
			'@typescript-eslint/no-import-type-side-effects': 'error',
			'@typescript-eslint/no-inferrable-types': 'error',
			'@typescript-eslint/no-invalid-void-type': 'error',
			'@typescript-eslint/no-redundant-type-constituents': 'error',
			'@typescript-eslint/restrict-plus-operands': 'error',
			'@typescript-eslint/array-type': 'error',
			'@typescript-eslint/no-array-delete': 'error',
			'import/no-extraneous-dependencies': 'error',
			'import/no-unresolved': 'off',
		},
	},
];
