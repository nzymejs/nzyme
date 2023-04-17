import { Simplify } from './Common';

export type KeysDeep<T extends Record<string | number, unknown>> = Simplify<
    | keyof T
    | {
          [K in keyof T]: K extends string | number ? KeysWithPrefix<K, T> : never;
      }[keyof T]
>;

type KeysWithPrefix<P extends string | number, T> = {
    [K in keyof T]: K extends string | number
        ? T[K] extends Record<string, unknown>
            ? `${P}.${K}` | KeysWithPrefix<`${P}.${K}`, T[K]>
            : `${P}.${K}`
        : never;
}[keyof T];
