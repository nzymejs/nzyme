import isEqual from 'lodash/isEqual';

export function deepEquals(a: any, b: any) {
    return isEqual(a, b);
}
