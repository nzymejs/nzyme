import { ObjectDirective } from 'vue';

type Hook = () => unknown;

/** Calls a given function when element is mounted. */
export const vMounted: ObjectDirective<Element, Hook | undefined | null> = {
    mounted(el, { value }) {
        value?.();
    },
};
