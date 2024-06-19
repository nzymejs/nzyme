/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-unused-vars

export type NonPartial<T> = { [P in keyof T]-?: T[P] };

export type Primitive = string | boolean | number;

export type Strict<T> = Exclude<T, null | undefined>;

export type Defined<T> = Exclude<T, undefined>;

export type Simplify<T> = Exclude<T, undefined>;

export type Flatten<T> = Exclude<
    {
        [K in keyof T]: T[K];
    },
    undefined
>;

export type PropertyNames<T> = {
    // eslint-disable-next-line @typescript-eslint/ban-types
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

/** Only properties of the object, without functions */
export type Properties<T> = {
    [K in PropertyNames<T>]: T[K];
};

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I,
) => void
    ? I
    : never;

export type FlattenUnion<T> = T extends any ? Flatten<T> : never;

export type Merge<T1, T2> = Exclude<
    {
        [K in keyof (T1 & T2)]: (T1 & T2)[K];
    },
    undefined
>;

export type Merge3<T1, T2, T3> = Exclude<
    {
        [K in keyof (T1 & T2 & T3)]: (T1 & T2 & T3)[K];
    },
    undefined
>;

export type Override<T1, T2> = Exclude<
    {
        [K in keyof (T1 & T2)]: K extends keyof T2 ? T2[K] : K extends keyof T1 ? T1[K] : never;
    },
    undefined
>;

export type Maybe<T> = T | null | undefined;

export type Item<T> = T[keyof T];

export type Writable<T> = { -readonly [P in keyof T]: T[P] };

// eslint-disable-next-line @typescript-eslint/ban-types
export type SomeObject = {};

export type Getter<T> = () => T;

export type ValueOf<T> = Exclude<T[keyof T], undefined>;

export type RecordToUnion<T extends Record<string, any>> = T[keyof T];

export type Fn<T = void> = () => T;

export type OmitProps<T, K extends keyof T> = {
    [P in keyof T as P extends K ? never : P]: T[P];
};

export type PickProps<T, K extends keyof T> = {
    [P in keyof T as P extends K ? P : never]: T[P];
} & {
    [P in keyof T as P extends K ? never : P]?: never;
};
