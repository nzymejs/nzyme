module.exports = {
    env: {
        browser: true,
        node: true,
    },
    extends: ['plugin:vue/vue3-recommended', './typescript.js'],
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.vue'],
    },
    plugins: [],
    rules: {
        'vue/multi-word-component-names': 'off',
    },
};
