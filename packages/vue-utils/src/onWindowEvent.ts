import { onMounted, onUnmounted } from 'vue';

export function onWindowEvent<K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions,
): void;
export function onWindowEvent(
    type: string,
    listener: (this: Window, ev: Event) => unknown,
    options?: boolean | AddEventListenerOptions,
): void;
export function onWindowEvent(
    type: string,
    listener: (this: Window, ev: Event) => unknown,
    options?: boolean | AddEventListenerOptions,
): void {
    onMounted(() => {
        window.addEventListener(type, listener, options);
    });

    onUnmounted(() => {
        window.removeEventListener(type, listener, options);
    });
}
