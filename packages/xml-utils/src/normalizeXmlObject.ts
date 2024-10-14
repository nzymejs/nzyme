export type MaybeXmlValue<T> = T | null | string;

export function normalizeXmlObject<T>(value: MaybeXmlValue<T>) {
    if (!value || typeof value === 'string') {
        return null;
    }

    return value;
}
