import { Flatten, FlattenUnion, IfLiteral, Simplify } from '@nzyme/types';

import { ArraySchema } from './ArraySchema.js';
import { SchemaAny, SchemaValue } from './Schema.js';
import { Typed, WithoutType } from './Typed.js';
import type { EntityRefSchema } from './entities/EntityRef.js';
import { ObjectProps } from './object/ObjectProps.js';
import type { ObjectDescriptor, ObjectDescriptorAny, ObjectSchema } from './object/ObjectSchema.js';

type FragmentSpreadKey = '...' | `...${string}`;

// Used for type inference.
const valueSymbol: unique symbol = Symbol();

export type FragmentValue<F extends FragmentAny> = F[typeof valueSymbol];

export type FragmentProps<P extends ObjectProps> = {
    readonly [K in keyof P]?: P[K] extends EntityRefSchema<any>
        ? Fragment<P[K]['entity']['props'] & P[K]['entity']['meta'], any> | true
        : P[K] extends ObjectSchema<infer T>
        ? Fragment<T['props'] & T['meta'], any> | true
        : P[K] extends ArraySchema<infer TItem>
        ? TItem extends ObjectSchema<infer T>
            ? Fragment<T['props'] & T['meta'], any> | true
            : true
        : true;
} & {
    readonly [K in FragmentSpreadKey]: FragmentAny;
};

export type FragmentInput<P extends ObjectProps, F extends FragmentProps<P>> = {
    readonly [K in keyof F]: K extends FragmentSpreadKey
        ? F[K] extends Fragment<infer P2, any>
            ? // Check if fragment type is extending the parent one
              P2 extends P
                ? F[K]
                : never
            : never
        : // Check if it's a known prop
        K extends keyof P
        ? F[K]
        : never;
};

export class Fragment<TProps extends ObjectProps = ObjectProps, TValue extends Typed = Typed> {
    // TODO: check if the fragment is correct in runtime
    constructor(
        public readonly descriptor: ObjectDescriptor,
        public readonly props: FragmentPropsInternal,
    ) {}

    readonly [valueSymbol]!: TValue;
}

export type FragmentAny = Fragment<any, any>;

type FragmentResultBase<
    TProps extends ObjectProps,
    TType extends string,
    TFragment extends FragmentProps<TProps>,
> = Flatten<
    Typed<TType> & {
        [K in keyof TFragment & keyof TProps]: TFragment[K] extends true
            ? TProps[K] extends SchemaAny
                ? SchemaValue<TProps[K]>
                : never
            : TFragment[K] extends FragmentAny
            ? FragmentValue<TFragment[K]>
            : never;
    }
>;

type FragmentSpread<TProps extends ObjectProps, TValue extends Typed> = {
    readonly [K in FragmentSpreadKey]: Fragment<TProps, TValue>;
};

type FragmentSpreadResult<P extends FragmentProps<any>> = P extends FragmentSpread<any, infer V>
    ? V
    : Typed;

type FragmentResult<
    TProps extends ObjectProps,
    TType extends string,
    P extends FragmentProps<TProps>,
> = FragmentMerge<FragmentResultBase<TProps, TType, P>, FragmentSpreadResult<P>>;

type FragmentPropsInternal = {
    [prop: string]: boolean | FragmentAny | FragmentPropsInternal;
} & {
    readonly [K in FragmentSpreadKey]: FragmentAny;
};

type BaseOf<T extends Typed> = T extends any ? IfLiteral<T['__typename'], never, T> : never;

type BaseProps<T extends Typed> = T extends any
    ? IfLiteral<T['__typename'], never, WithoutType<T>>
    : never;

type FragmentMerge<T1 extends Typed, T2 extends Typed> = FlattenUnion<
    IfLiteral<
        T2['__typename'],
        T1 | (T2 & BaseProps<T1>),
        (Exclude<T1, BaseOf<T1>> & BaseProps<T2>) | (T2 & BaseProps<T1>)
    >
>;

export function createFragment<
    TProps extends ObjectProps,
    TType extends string,
    TMeta extends ObjectProps,
    TFragment extends FragmentProps<TProps & TMeta>,
>(
    descriptor: ObjectDescriptorAny,
    fragment: TFragment,
): FragmentFrom<TProps, TType, TMeta, TFragment> {
    return new Fragment(descriptor, fragment as FragmentPropsInternal);
}

export type FragmentFrom<
    TProps extends ObjectProps,
    TType extends string,
    TMeta extends ObjectProps,
    TFragment extends FragmentProps<TProps & TMeta>,
> = Simplify<Fragment<TProps & TMeta, FragmentResult<TProps & TMeta, TType, TFragment>>>;
