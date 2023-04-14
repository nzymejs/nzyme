import { Simplify } from './Common';

export type KeysDeep<T> = Exclude<
    | keyof T
    | {
          [K in keyof T]: KeysWithPrefix<K, T>;
      }[keyof T],
    undefined
>;

type KeysWithPrefix<P, T> = {
    [K in keyof T]: T[K] extends Record<string, unknown>
        ? `${P}.${K}` | KeysWithPrefix<`${P}.${K}`, T[K]>
        : `${P}.${K}`;
}[keyof T];
