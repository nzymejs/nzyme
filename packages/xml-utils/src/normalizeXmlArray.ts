export type MaybeXmlArray<T> = T | T[] | null | string;

export function normalizeXmlArray<T>(value: MaybeXmlArray<T>): T[] {
    if (!value || typeof value === 'string') {
        return [];
    }

    if (Array.isArray(value)) {
        return value;
    }

    return [value];
}
