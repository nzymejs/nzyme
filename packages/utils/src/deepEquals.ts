import isEqual from 'lodash.isequal';

export function deepEquals(a: unknown, b: unknown) {
    return isEqual(a, b);
}
