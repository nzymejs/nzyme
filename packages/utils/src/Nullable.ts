export type Nullable<T, TNullable extends boolean> = TNullable extends false ? T : T | null;

export function nullable<T, TNullable extends boolean>(value?: T | null): Nullable<T, TNullable> {
    return value || (null as Nullable<T, TNullable>);
}
