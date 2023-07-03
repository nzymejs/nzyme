import type { GraphQLType } from 'graphql';

import { Translatable } from '@nzyme/i18n';

export interface SchemaDescriptorConfig {
    readonly type: string;
    readonly name?: Translatable | string;
}

interface SchemaDescriptorGraphqlConfig {
    readonly graphqlType?: GraphQLType;
}

export abstract class SchemaDescriptor {
    public readonly typename: string;
    public readonly name: Translatable;
    public readonly symbol = Symbol();
    public abstract readonly graphqlType: GraphQLType | undefined;

    constructor(config: SchemaDescriptorConfig) {
        this.typename = config.type;
        this.name = config.name || config.type;
    }
}

export class GenericDescriptor extends SchemaDescriptor {
    public readonly graphqlType: GraphQLType | undefined;

    constructor(config: SchemaDescriptorConfig & SchemaDescriptorGraphqlConfig) {
        super(config);
        this.graphqlType = config.graphqlType;
    }
}
