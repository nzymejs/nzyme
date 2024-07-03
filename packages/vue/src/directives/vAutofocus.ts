import type { ObjectDirective } from 'vue';

export const vAutofocus: ObjectDirective<Element, boolean | undefined | null> = {
    mounted(el, binding) {
        const disabled = binding.value === false;
        if (disabled) {
            return;
        }

        if (el instanceof HTMLElement) {
            setTimeout(() => el.focus());
        }
    },
};
