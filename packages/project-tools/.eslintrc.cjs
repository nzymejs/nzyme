module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [require.resolve('@nzyme/eslint/typescript')],
    parserOptions: {
        project: `${__dirname}/tsconfig.json`,
    },
};
