export type VModelEmits<T, K extends keyof T & string> = {
    (event: `update:${K}`, value: T[K]): void;
};
