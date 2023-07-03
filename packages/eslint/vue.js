module.exports = {
    env: {
        browser: true,
        node: true,
    },
    extends: ['./typescript.js', 'plugin:vue/vue3-recommended'],
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
    },
    plugins: [],
    rules: {},
};
