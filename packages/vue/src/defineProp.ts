import type { PropType } from 'vue';

interface PropOptions<T = unknown, D = T> {
    type?: PropType<T> | true | null;
    required?: boolean;
    default?: D | (() => D) | null | undefined | object;
    validator?(value: unknown): boolean;
}

type PropOptionsRequired<T> = PropOptions<T> & { required: true };
type PropOptionsOptional<T> = PropOptions<T | null> & { required?: false };

export function defineProp<T>(): PropOptionsOptional<T>;
export function defineProp<T>(opts: PropOptionsRequired<T>): PropOptionsRequired<T>;
export function defineProp<T>(opts: PropOptionsOptional<T>): PropOptionsOptional<T>;
export function defineProp<T>(opts?: PropOptions<T>) {
    return opts || ({} as PropOptions<T>);
}
