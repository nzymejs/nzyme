module.exports = {
    plugins: ['eslint-plugin-jsdoc'],
    extends: ['plugin:jsdoc/recommended-typescript'],
    rules: {
        'jsdoc/require-jsdoc': [
            1,
            {
                publicOnly: {
                    ancestorsOnly: true,
                    esm: true,
                    cjs: false,
                },
                contexts: [
                    'ClassDeclaration',
                    'ClassProperty',
                    'FunctionDeclaration',
                    'MethodDefinition',
                    'TSDeclareFunction',
                    'TSEnumDeclaration',
                    'TSInterfaceDeclaration',
                    'TSMethodSignature',
                    'TSPropertySignature',
                    'TSTypeAliasDeclaration',
                ],
            },
        ],
    },
};
