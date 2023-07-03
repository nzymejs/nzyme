import { Schema } from './Schema.js';

interface SchemaComparableString<T> extends Schema<T> {
    sortType: 'string';
    sortValue(value: T): string;
}

interface SchemaComparableNumber<T> extends Schema<T> {
    sortType: 'number';
    sortValue(value: T): number;
}

export type SchemaComparable<T, S extends string | number = string | number> = S extends string
    ? SchemaComparableString<T>
    : SchemaComparableNumber<T>;

export function isSchemaComparable<T>(schema: Schema<T>): schema is SchemaComparable<T> {
    const comparable = schema as SchemaComparable<T>;
    return comparable.sortType && !!comparable.sortValue;
}
