/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-unused-vars

export type NonPartial<T> = { [P in keyof T]-?: T[P] };

export type Primitive = string | boolean | number;

export type Strict<T> = Exclude<T, null | undefined>;

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

export type Override<T1, T2> = Exclude<
    {
        [K in keyof (T1 & T2)]: K extends keyof T2 ? T2[K] : K extends keyof T1 ? T1[K] : never;
    },
    undefined
>;

export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
export type IsAny<T> = IfAny<T, true, false>;
export type FallbackAny<T, F> = IfAny<T, F, T>;

export type IfNullable<T, Y, N> = IsAny<T> extends true ? boolean : T | null extends T ? Y : N;
export type IsNullable<T> = IfNullable<T, true, false>;

export type IfUndefined<T, Y, N> = IsAny<T> extends true
    ? boolean
    : T | undefined extends T
    ? Y
    : N;
export type IsUndefined<T> = IfUndefined<T, true, false>;

export type IfTrue<T extends boolean, Y, N> = T extends true ? Y : N;

export type Maybe<T> = T | null | undefined;

export type Item<T> = T extends any[] ? T[0] : T[keyof T];

export type PromiseValue<T extends Promise<unknown>> = T extends Promise<infer V> ? V : never;

export type Dictionary<TKey extends string | number, TValue> = {
    [P in TKey]+?: TValue;
};

export type Writable<T> = { -readonly [P in keyof T]: T[P] };

// eslint-disable-next-line @typescript-eslint/ban-types
export type SomeObject = {};
export type EmptyObject = Record<string, never>;

export type Getter<T> = () => T;
