import { onWindowEvent } from './onWindowEvent';

export function onWindowScroll(callback: () => void) {
    onWindowEvent('scroll', callback, { passive: true });
}
