import { isBrowser } from '@barebone/dom-utils';
import { onMounted } from 'vue';

import { useElement } from './useElement.js';

/**
 * Workaround for https://github.com/vuejs/core/issues/5844
 * Based on https://github.com/nuxt/nuxt/issues/13471
 */
export function onMountedSafe(listener: () => unknown) {
    if (!isBrowser()) {
        return;
    }

    const element = useElement();

    const checkInterval = 50;
    let checksLeft = 50;

    const check = () => {
        if (element.value?.isConnected) {
            listener();
        } else if (checksLeft > 0) {
            setTimeout(check, checkInterval);
            checksLeft--;
        }
    };

    onMounted(() => {
        check();
    });
}
