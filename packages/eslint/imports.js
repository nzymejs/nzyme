module.exports = {
    extends: ['plugin:import/errors', 'plugin:import/warnings', 'plugin:import/typescript'],
    plugins: ['eslint-plugin-import'],
    rules: {
        'import/order': [
            'warn',
            {
                'newlines-between': 'always',
                groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index'],
                // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/order.md#pathgroups-array-of-objects
                pathGroups: [
                    {
                        pattern: '@nzyme/**',
                        group: 'internal',
                        position: 'before',
                    },
                ],
                pathGroupsExcludedImportTypes: ['builtin'],
                alphabetize: {
                    order: 'asc',
                },
            },
        ],
        // we have TypeScript handling that
        'import/no-unresolved': 'off',
    },
};
