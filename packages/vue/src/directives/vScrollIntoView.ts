import type { ObjectDirective } from 'vue';

type ScrollIntoViewOptions = {
    trigger?: boolean | number;
    options?: globalThis.ScrollIntoViewOptions;
};

export const vScrollIntoView: ObjectDirective<Element, ScrollIntoViewOptions | undefined | null> = {
    mounted(el, binding) {
        const enabled = isEnabled(binding.value?.trigger);
        if (enabled) {
            setTimeout(() => el.scrollIntoView(binding.value?.options));
        }
    },
    updated(el, binding) {
        const oldTrigger = binding.oldValue?.trigger;
        const newTrigger = binding.value?.trigger;

        if (oldTrigger === newTrigger) {
            return;
        }

        const enabled = isEnabled(newTrigger);
        if (enabled) {
            setTimeout(() => el.scrollIntoView(binding.value?.options));
        }
    },
};

function isEnabled(trigger: boolean | number | undefined): boolean {
    return trigger === undefined || !!trigger;
}
