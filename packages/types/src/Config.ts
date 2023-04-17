import { Flatten } from './Common';

export type ConfigDefault<T, V extends Partial<T>, D extends T> = Flatten<{
    [K in keyof T]: K extends keyof V ? V[K] : K extends keyof D ? D[K] : never;
}>;
