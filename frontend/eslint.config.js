import antfu from '@antfu/eslint-config'

export default antfu(
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            'public/**',
            '.vite/**',
            'eslint.config.js'
        ],

        stylistic: {
            indent: 2,
            semi: false,
            quotes: 'single',
            commaDangle: 'always-multiline',
            quoteProps: 'consistent-as-needed',
            jsx: true,
        },

        typescript: {
            tsconfigPath: './tsconfig.app.json',
            typeAwareRules: false,
        },

        react: true,
        vue: false,
    },

    {
        rules: {
            'no-console': 'off',
            'no-debugger': 'off',
            'no-alert': 'off',

            'ts/no-explicit-any': 'off',
            'ts/ban-ts-comment': 'off',
            'ts/consistent-type-imports': ['error', { prefer: 'type-imports' }],

            'react/no-implicit-key': 'off',
            'react-refresh/only-export-components': 'off',
        },
    }
)