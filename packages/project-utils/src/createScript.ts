interface ImportParams {
    from: string;
    import?: string;
    name?: string;
}

export function createScript() {
    const imports: string[] = [];
    const statements: string[] = [];
    const variables: Record<string, number | undefined> = {};

    return {
        addImport,
        addStatement,
        addEmptyLine,
        addComment,
        addVariable,
        getCode,
    };

    function addImport(params: ImportParams) {
        const importName = addVariable(params.name || 'import');

        if (!params.import) {
            // Default import
            imports.push(`import ${importName} from "${params.from}";`);
        } else if (params.import === '*') {
            // Import all
            imports.push(`import * as ${importName} from "${params.from}";`);
        } else {
            // Named import
            imports.push(`import { ${params.import} as ${importName} } from "${params.from}";`);
        }

        return importName;
    }

    function addStatement(statement: string) {
        if (!statement.endsWith(';')) {
            statement += ';';
        }

        statements.push(statement);
    }

    function addEmptyLine() {
        statements.push('');
    }

    function addComment(comment: string) {
        statements.push(`// ${comment}`);
    }

    function addVariable(name: string = 'var') {
        if (!variables[name]) {
            variables[name] = 0;
        }

        variables[name]++;
        return `${name}_${variables[name]}`;
    }

    function getCode() {
        let code = '';

        code += imports.join('\n');
        code += '\n';
        code += statements.join('\n');

        return code;
    }
}

export type ScriptBuilder = ReturnType<typeof createScript>;
