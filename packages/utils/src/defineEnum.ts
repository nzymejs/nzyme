export type Enum<T extends string[]> = T & {
    [K in T[number] as K & string]: K;
};

/*#__NO_SIDE_EFFECTS__*/
export function defineEnum<const T extends string[]>(values: T): Enum<T> {
    for (const value of values) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        values[value as any] = value;
    }

    return values as Enum<T>;
}
