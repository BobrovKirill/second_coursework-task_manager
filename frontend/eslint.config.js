import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import antfu from '@antfu/eslint-config'
import { defineConfig } from 'eslint/config'

export default defineConfig([
    {
        ignores: [
            'dist/',
            'node_modules/',
            'public/',
        ],
    },

    // База
    js.configs.recommended,
    ...tseslint.configs.recommended,

    // Antfu (стиль и TS-поведение)
    ...antfu(
        {
            stylistic: {
                indent: 2,
                semi: false,
                quotes: 'single',
                commaDangle: 'always',
                quoteProps: 'consistent-as-needed',
                jsx: true,
            },

            typescript: true,
            react: true,
            vue: false,
        },
        {
            rules: {
                // Общие послабления
                'no-console': 'off',
                'no-debugger': 'off',
                'no-alert': 'off',

                // TS
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/explicit-module-boundary-types': 'off',
                '@typescript-eslint/ban-ts-comment': 'off',
                '@typescript-eslint/no-var-requires': 'off',
                '@typescript-eslint/no-extra-semi': 'off',
                '@typescript-eslint/consistent-type-imports': [
                    'error',
                    { prefer: 'type-imports' },
                ],
            },
        },
    ),

    // React
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,

            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
        },
    },
])