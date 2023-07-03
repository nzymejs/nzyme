import { GraphQLString } from 'graphql';

import { Nullable } from '@nzyme/utils';
import { regexValidator, requiredError } from '@nzyme/validation';

import { SchemaComparable } from './SchemaComparable.js';
import { GenericDescriptor } from './SchemaDescriptor.js';
import { SchemaPrimitive, SchemaPrimitiveConfig } from './SchemaPrimitive.js';
import { GRAPHQL } from './env.js';

export interface StringSchemaConfig<TNullable extends boolean>
    extends SchemaPrimitiveConfig<string, TNullable> {
    nonEmpty?: boolean;
    // TODO add validation
    multiline?: boolean;
    regex?: RegExp;
}

export class StringSchema<TNullable extends boolean = false>
    extends SchemaPrimitive<string, TNullable>
    implements SchemaComparable<Nullable<string, TNullable>, string>
{
    public static readonly descriptor = new GenericDescriptor({
        type: 'String',
        name: 'String value',
        graphqlType: GRAPHQL ? GraphQLString : undefined,
    });

    public readonly nonEmpty: boolean;
    public readonly multiline: boolean;
    public readonly type = 'string';
    public readonly sortType = 'string';

    constructor(config: StringSchemaConfig<TNullable> = {}) {
        super(config, '');
        this.nonEmpty = !!config.nonEmpty;
        this.multiline = !!config.multiline;

        if (this.nonEmpty) {
            this.addValidator((value, ctx) => {
                if (value === '') {
                    // If string is non-empty consider value to be null if empty.
                    return requiredError();
                }
            });
        }

        if (config.regex) {
            this.addValidator(regexValidator(config.regex));
        }
    }

    public get descriptor() {
        return StringSchema.descriptor;
    }

    public sortValue(value: string): string {
        return value;
    }

    public stringify(value: string): string {
        return value;
    }

    public normalize(value: unknown): Nullable<string, TNullable> {
        if (value === null) {
            return this.defaultValueOrNull();
        }

        if (value === undefined) {
            return this.defaultValue();
        }

        return value.toString();
    }
}
