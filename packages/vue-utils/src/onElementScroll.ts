import { onMounted, onUnmounted, watch } from 'vue';

import type { RefParam } from './reactivity/makeRef.js';
import { makeRef } from './reactivity/makeRef.js';

type ElementParam = Element | Window | undefined | null;

export function onElementScroll(element: RefParam<ElementParam>, callback: (event: Event) => void) {
    const elementRef = makeRef(element);

    watch(
        () => elementRef.value,
        (current, previous) => {
            disconnect(previous);
            connect(current);
        },
    );

    onMounted(() => connect(elementRef.value));
    onUnmounted(() => disconnect(elementRef.value));

    function connect(el: ElementParam) {
        el?.addEventListener('scroll', callback, { passive: true });
    }

    function disconnect(el: ElementParam) {
        el?.removeEventListener('scroll', callback);
    }
}
