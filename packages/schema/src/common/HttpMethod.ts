import { EnumSchema } from '../EnumSchema.js';
import { SchemaValue } from '../Schema.js';

export const HttpMethod = EnumSchema.define({
    type: 'HttpMethod',
    values: {
        GET: { name: 'GET' },
        POST: { name: 'POST' },
        PUT: { name: 'PUT' },
        DELETE: { name: 'DELETE' },
        PATCH: { name: 'PATCH' },
        HEAD: { name: 'HEAD' },
        OPTIONS: { name: 'OPTIONS' },
    },
});

export type HttpMethod = SchemaValue<typeof HttpMethod>;
