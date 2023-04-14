export type IfLiteral<T extends string, Y, N> = T | 'jy@##O8sjzv=(+mby#4T=3gLHwU+0Z' extends T
    ? N
    : Y;

export type IsLiteral<T extends string> = IfLiteral<T, true, false>;
