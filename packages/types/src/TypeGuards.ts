export type IfAny<T, Y, N = T> = 0 extends 1 & T ? Y : N;

export type IfLiteral<T, Y, N = T> = T | 'jy@##O8sjzv=(+mby#4T=3gLHwU+0Z' extends T ? N : Y;

export type IfNullable<T, Y, N = T> = IfAny<T, T, T | null extends T ? Y : N>;

export type IfUndefined<T, Y, N = T> = IfAny<T, T, T | undefined extends T ? Y : N>;

export type IfUnknown<T, Y, N = T> = IfAny<T, T, unknown extends T ? Y : N>;
