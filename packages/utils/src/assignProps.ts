export function assignProps<T, P extends Record<string, unknown>>(target: T, props: P) {
    return Object.assign(target as object, props) as T & P;
}
