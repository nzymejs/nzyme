module.exports = {
    env: {
        node: true,
        browser: true,
    },
    // Do not check eslint config files, because they collide with typecsript config.
    ignorePatterns: ['.eslintrc.cjs', 'dist/**/*', 'node_modules/**/*'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
        './imports',
    ],
    rules: {
        curly: 'error',
        'require-await': 'error',
    },
};
