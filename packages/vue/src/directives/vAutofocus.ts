import { isBrowser } from '@barebone/dom-utils';
import type { ObjectDirective } from 'vue';


export const vAutofocus: ObjectDirective<Element, boolean | undefined | null> = {
    mounted(el, binding) {
        const enabled = binding.value === undefined || !!binding.value;
        if (!enabled) {
            return;
        }

        if (isBrowser() && el instanceof HTMLElement) {
            setTimeout(() => el.focus());
        }
    },
};
