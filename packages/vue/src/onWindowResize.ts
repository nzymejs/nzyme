import { onWindowEvent } from './onWindowEvent';

export function onWindowResize(callback: () => void) {
    onWindowEvent('resize', callback, { passive: true });
}
