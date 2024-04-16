import { virtualHistory, type VirtualHistoryHandle } from '@barebone/dom-utils';
import { onBeforeUnmount } from 'vue';


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
