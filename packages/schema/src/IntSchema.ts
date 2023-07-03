import { GraphQLInt } from 'graphql';

import { NumberSchema, NumberSchemaConfig } from './NumberSchema.js';
import { GenericDescriptor } from './SchemaDescriptor.js';
import { GRAPHQL } from './env.js';

export class IntSchema<TNullable extends boolean = false> extends NumberSchema<TNullable> {
    public static override readonly descriptor = new GenericDescriptor({
        type: 'Int',
        name: 'Integer number',
        graphqlType: GRAPHQL ? GraphQLInt : undefined,
    });

    constructor(config: NumberSchemaConfig<TNullable> = {}) {
        super(config);
    }

    public override get descriptor() {
        return IntSchema.descriptor;
    }
}
