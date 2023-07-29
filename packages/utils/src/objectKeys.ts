export function objectKeys<T extends {}>(obj: T) {
    return Object.keys(obj) as (keyof T)[];
}
