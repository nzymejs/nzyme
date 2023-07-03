import { Schema, SchemaOptions } from './Schema.js';
import { GenericDescriptor } from './SchemaDescriptor.js';

export class VoidSchema extends Schema<void> {
    public static readonly descriptor = new GenericDescriptor({
        type: 'Void',
        name: 'No value',
        graphqlType: undefined,
    });

    constructor(config: SchemaOptions<void> = {}) {
        super(config);
    }

    public get descriptor() {
        return VoidSchema.descriptor;
    }

    public defaultValue(): void {
        return;
    }

    public is(obj: unknown): obj is void {
        return obj === undefined;
    }

    public coerce(): void {
        return;
    }

    public serialize(): unknown {
        return;
    }

    public deserialize(): void {
        return;
    }

    public stringify(): string {
        return '';
    }
}
