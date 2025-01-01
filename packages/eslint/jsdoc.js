module.exports = {
    plugins: ['eslint-plugin-jsdoc'],
    extends: ['plugin:jsdoc/recommended-typescript'],
    rules: {
        'jsdoc/require-jsdoc': [
            1,
            {
                publicOnly: {
                    esm: true,
                    cjs: false,
                },
                contexts: [
                    'ClassDeclaration',
                    'ClassProperty',
                    'FunctionDeclaration',
                    'MethodDefinition',
                    'ExportNamedDeclaration > VariableDeclaration',
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
