import { GraphQLBoolean } from 'graphql';

import { Nullable } from '@nzyme/utils';

import { SchemaComparable } from './SchemaComparable.js';
import { GenericDescriptor } from './SchemaDescriptor.js';
import { SchemaPrimitive, SchemaPrimitiveConfig } from './SchemaPrimitive.js';
import { GRAPHQL } from './env.js';

export class BooleanSchema<TNullable extends boolean = false>
    extends SchemaPrimitive<boolean, TNullable>
    implements SchemaComparable<Nullable<boolean, TNullable>, number>
{
    public static readonly descriptor = new GenericDescriptor({
        type: 'Boolean',
        name: 'Boolean value',
        graphqlType: GRAPHQL ? GraphQLBoolean : undefined,
    });

    public readonly type = 'boolean';
    public readonly sortType = 'number';

    constructor(config: SchemaPrimitiveConfig<boolean, TNullable> = {}) {
        super(config, false);
    }

    public get descriptor() {
        return BooleanSchema.descriptor;
    }

    public sortValue(value: boolean): number {
        return value ? 1 : 0;
    }

    public stringify(value: boolean): string {
        return value.toLocaleString();
    }

    public normalize(value: unknown): Nullable<boolean, TNullable> {
        if (value === null) {
            return this.defaultValueOrNull();
        }

        if (value === undefined) {
            return this.defaultValue();
        }

        return Boolean(value);
    }
}
