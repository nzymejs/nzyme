import type { EmptyObject, IfNullable, Primitive } from '@nzyme/types';

export type SchemaDefault<T> = T extends Primitive ? T | (() => T) : () => T;

export type SchemaOptions<
    T,
    TNullable extends boolean = false,
    TMeta extends object = EmptyObject,
> = {
    nullable?: TNullable;
    meta?: TMeta | null | undefined;
    default?: SchemaDefault<T>;
};

export type Schema<T, M extends object = EmptyObject> = {
    type: string;
    nullable: IfNullable<T, true, false>;
    parse: (value: unknown) => T | null;
    serialize: (value: T) => unknown;
    meta: M;
    default: (() => T) | null;
};

export type SchemaValue<T, TNullable extends boolean> = TNullable extends true ? T | null : T;

type CreateSchemaParams<T, TNullable extends boolean, TMeta extends object> = {
    type: string;
    parse: (value: unknown) => T | undefined;
    serialize: (value: T) => unknown;
    options: SchemaOptions<T, TNullable, TMeta> | undefined;
};

export function createSchema<T, TNullable extends boolean, TMeta extends object>(
    params: CreateSchemaParams<T, TNullable, TMeta>,
) {
    type S = Schema<SchemaValue<T, TNullable>, TMeta>;
    const options = params.options ?? {};

    const schema: S = {
        type: params.type,
        nullable: (options.nullable ?? false) as S['nullable'],
        parse: params.parse as S['parse'],
        serialize: params.serialize as S['serialize'],
        meta: options.meta ?? ({} as S['meta']),
        default: getDefault(options),
    };

    return schema;
}

function getDefault<T, TNullable extends boolean, TMeta extends object>(
    options: SchemaOptions<T, TNullable, TMeta>,
) {
    const def = options.default;
    type Getter = () => SchemaValue<T, TNullable>;

    if (def === undefined) {
        if (options.nullable) {
            return (() => null) as Getter;
        }

        return null;
    }

    if (typeof def === 'function') {
        return def as Getter;
    }

    return (() => def) as Getter;
}
