module.exports = {
    root: true,
    extends: [require.resolve('@nzyme/eslint/typescript')],
    parserOptions: {
        project: [
            `${__dirname}/tsconfig.json`,
            // TS config for tests
            `${__dirname}/tsconfig.tests.json`,
        ],
    },
    rules: {
        '@typescript-eslint/no-namespace': 'off',
    },
};
