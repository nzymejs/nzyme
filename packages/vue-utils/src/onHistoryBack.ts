import type { VirtualHistoryHandle } from '@nzyme/dom-utils';

import { useVirtualHistory } from './useVirtualHistory.js';

export function onHistoryBack(callback: () => void) {
    const virtualHistory = useVirtualHistory();

    let handle: VirtualHistoryHandle | undefined;

    return {
        init() {
            if (!handle) {
                handle = virtualHistory.pushState(callback);
            }
        },
        cancel() {
            if (handle) {
                handle.cancel();
                handle = undefined;
            }
        },
    };
}
