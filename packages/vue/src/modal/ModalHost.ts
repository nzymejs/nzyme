import { defineComponent, h, Suspense } from 'vue';

import { useService } from '../useService';

import { ModalService } from './ModalService';
import { Modal, ModalComponent, ModalHandlerProps, ModalResult } from './ModalTypes';

export const ModalHost = defineComponent({
    name: 'ModalHost',
    setup() {
        const modalService = useService(ModalService);
        return () =>
            modalService.modals.map(modal => {
                return h(modal.component);
            });
    },
});
