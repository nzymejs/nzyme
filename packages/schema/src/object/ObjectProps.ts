import { Flatten } from '@nzyme/types';

import { Schema, SchemaQuery, SchemaValue } from '../Schema.js';
import { Typed } from '../Typed.js';

export type ObjectProps = Record<string, Schema<unknown>>;

export type ObjectPropsValue<TProps extends ObjectProps> = {
    [K in keyof TProps]: SchemaValue<TProps[K]>;
};

export type ObjectPropsQuery<TProps extends ObjectProps> = {
    [K in keyof TProps]: SchemaQuery<TProps[K]>;
};

export type ObjectPropsValueTyped<TProps extends ObjectProps, TType extends string> = Flatten<
    Typed<TType> & ObjectPropsValue<TProps>
>;
