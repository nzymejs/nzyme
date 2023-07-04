import { GraphQLFloat } from 'graphql';

import { Nullable } from '@nzyme/utils';
import { maxValidator, minValidator } from '@nzyme/validation';

import { SchemaComparable } from './SchemaComparable.js';
import { GenericDescriptor } from './SchemaDescriptor.js';
import { SchemaPrimitive, SchemaPrimitiveConfig } from './SchemaPrimitive.js';
import { GRAPHQL } from './env.js';

export interface NumberSchemaConfig<TNullable extends boolean>
    extends SchemaPrimitiveConfig<number, TNullable> {
    min?: number;
    max?: number;
}

export class NumberSchema<TNullable extends boolean = false>
    extends SchemaPrimitive<number, TNullable>
    implements SchemaComparable<Nullable<number, TNullable>, number>
{
    public static readonly descriptor = new GenericDescriptor({
        type: 'Float',
        name: 'Float number',
        graphqlType: GRAPHQL ? GraphQLFloat : undefined,
    });

    public readonly type = 'number';
    public readonly sortType = 'number';
    public readonly min?: number;
    public readonly max?: number;

    constructor(config: NumberSchemaConfig<TNullable> = {}) {
        super(config, config.min ?? 0);

        if (config.min) {
            this.min = config.min;
            this.addValidator(minValidator({ minValue: config.min }));
        }

        if (config.max) {
            this.max = config.max;
            this.addValidator(maxValidator({ maxValue: config.max }));
        }
    }

    public get descriptor() {
        return NumberSchema.descriptor;
    }

    public sortValue(value: number): number {
        return value;
    }

    public stringify(value: number): string {
        return value.toLocaleString();
    }

    public normalize(value: unknown): Nullable<number, TNullable> {
        if (value === null) {
            const serialized = this.nullable ? null : this.defaultValue();
            return serialized as Nullable<number, TNullable>;
        }

        if (value === undefined) {
            return this.defaultValue();
        }

        return Number(value);
    }
}
