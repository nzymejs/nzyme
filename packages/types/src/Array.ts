export type ArrayItem<T extends readonly unknown[]> = T[keyof T & number];
