import { onBeforeUnmount } from 'vue';

import { virtualHistory, type VirtualHistoryHandle } from '@nzyme/dom';

type Callback = () => void;

export function useVirtualHistory() {
    const handles: VirtualHistoryHandle[] = [];

    onBeforeUnmount(() => {
        for (const handle of handles) {
            handle.cancel();
        }
    });

    return {
        pushState(callback: Callback) {
            const handle = virtualHistory.pushState(callback);
            handles.push(handle);
            return handle;
        },
    };
}
