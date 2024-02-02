module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [require.resolve('@nzyme/eslint/vue')],
    parserOptions: {
        project: `${__dirname}/tsconfig.json`,
    },
};
