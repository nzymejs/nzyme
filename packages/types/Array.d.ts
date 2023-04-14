export type ArrayItem<T extends readonly any[]> = T[keyof T & number];
