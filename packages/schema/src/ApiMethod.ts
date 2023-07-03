import { Translatable } from '@nzyme/i18n';

import { InputObjectSchema, InputObjectSchemaAny } from './InputObjectSchema.js';
import { Schema, SchemaAny } from './Schema.js';

export type ApiMethodType = 'query' | 'mutation';

export interface ApiMethodConfig<TInput extends InputObjectSchemaAny, TResult extends SchemaAny> {
    type: ApiMethodType;
    description?: string | Translatable;
    input: TInput;
    result: TResult;
    /** Symbol to easily identify API method. */
    symbol?: symbol;
}

export class ApiMethod<
    TInput extends InputObjectSchemaAny = InputObjectSchema,
    TResult extends SchemaAny = Schema,
> {
    public readonly type: ApiMethodType;
    public readonly input: TInput;
    public readonly result: TResult;
    public readonly description: Translatable;
    public readonly symbol?: symbol;

    constructor(config: ApiMethodConfig<TInput, TResult>) {
        this.type = config.type;
        this.input = config.input;
        this.result = config.result;
        this.description = config.description || '';
        this.symbol = config.symbol;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiMethodAny = ApiMethod<any, any>;
export type ApiMethods = Record<string, ApiMethod>;
export type ApiMethodsAny = Record<string, ApiMethodAny>;
