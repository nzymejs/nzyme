module.exports = {
    root: true,
    extends: [require.resolve('@nzyme/eslint/typescript')],
    parserOptions: {
        project: `${__dirname}/tsconfig.json`,
    },
};
