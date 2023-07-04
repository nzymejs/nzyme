import { getCurrentInstance, onUnmounted } from 'vue';

import { arrayRemove } from '@nzyme/utils';

import { ModalService } from './ModalService.js';
import { Modal, ModalComponent, OpenModalOptions } from './ModalTypes.js';
import { useService } from '../useService.js';

interface ModalOptions {
    /**
     * Close all open modals when component is unmounted.
     * By default true
     */
    closeOnUnmounted?: boolean;
}

export function useModal(opts?: ModalOptions) {
    const instance = getCurrentInstance();
    const modalService = useService(ModalService);
    const localModals: Modal[] = [];

    const closeOnUnmounted = opts?.closeOnUnmounted ?? true;
    if (closeOnUnmounted && instance) {
        onUnmounted(() => {
            localModals.forEach(m => m.handler.close());
        });
    }

    return {
        /**
         * Opens a modal.
         * @param options Options for modal.
         * @returns Promise with modal result that resolves when modal is closed.
         */
        open<T extends ModalComponent>(options: OpenModalOptions<T>) {
            const modal = modalService.open({
                ...options,
                parent: instance,
            });
            localModals.push(modal);

            // Remove modal from local ones when it is closed.
            modal.finally(() => arrayRemove(localModals, modal));

            return modal;
        },
        closeAll() {
            modalService.closeAll();
        },
    };
}
