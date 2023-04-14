import { ValueOf } from './ObjectUtils';

export function mapObject<T, TTo>(
    obj: T,
    map: (value: ValueOf<T>, key: keyof T, index: number) => TTo,
) {
    const result = {} as {
        [K in keyof T]: TTo;
    };
    let index = 0;
    for (const key in obj) {
        const value = obj[key];
        if (value !== undefined) {
            result[key] = map(value as ValueOf<T>, key, index);
        }

        index++;
    }

    return result;
}
