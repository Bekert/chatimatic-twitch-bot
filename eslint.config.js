import babelParser from '@babel/eslint-parser'
import js from '@eslint/js'
import globals from 'globals'

export default [
	js.configs.recommended,
	{
		languageOptions: {
			parser: babelParser,
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: {
				ecmaFeatures: {
					jsx: true
				}
			},
			globals: {
				...globals.browser,
				...globals.node
			}
		},
		rules: {
			'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			semi: ['error', 'never'],
			'max-len': ['warn', { code: 100 }],
			quotes: ['error', 'single', { avoidEscape: true }],
			'jsx-quotes': ['error', 'prefer-single'],
			'quote-props': ['error', 'as-needed'],
			'comma-dangle': ['error', 'never'],
			'object-curly-spacing': ['error', 'always'],
			'array-bracket-spacing': ['error', 'never'],
			'arrow-parens': ['error', 'as-needed']
		},
		ignores: ['dist', 'build', 'node_modules']
	}
]
