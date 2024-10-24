import { onMounted, onUnmounted } from 'vue';

export function onWindowEvent<K extends keyof WindowEventMap>(
    type: K,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (this: Window, ev: WindowEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
): void {
    onMounted(() => {
        window.addEventListener(type, listener, options);
    });

    onUnmounted(() => {
        window.removeEventListener(type, listener, options);
    });
}
