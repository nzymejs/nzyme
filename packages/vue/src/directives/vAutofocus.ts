import type { ObjectDirective } from 'vue';

import { isBrowser } from '@nzyme/dom';

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
