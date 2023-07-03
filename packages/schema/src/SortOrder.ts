import { EnumSchema } from './EnumSchema.js';
import { SchemaValue } from './Schema.js';

export const SortOrder = EnumSchema.define({
    type: 'SortOrder',
    name: 'Sorting order',
    values: {
        asc: {
            name: 'Sort ascending',
        },
        desc: {
            name: 'Sort descending',
        },
    },
    default: 'asc',
});

export type SortOrder = SchemaValue<typeof SortOrder>;
