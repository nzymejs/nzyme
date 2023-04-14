export type NonVoidProps<T> = {
    [K in keyof T as T[K] extends void | never ? never : K]: T[K];
};

export type NonVoidPropKeys<T> = keyof NonVoidProps<T>;

export type VoidPropKeys<T> = keyof {
    [K in keyof T as T[K] extends void | never ? K : never]: T[K];
};
