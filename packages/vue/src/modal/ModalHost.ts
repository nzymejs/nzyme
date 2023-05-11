import { defineComponent, h, Suspense } from 'vue';

import { useService } from '../useService';

import { ModalService } from './ModalService';
import { Modal, ModalComponent, ModalHandlerProps, ModalResult } from './ModalTypes';

export const ModalHost = defineComponent({
    setup() {
        const modalService = useService(ModalService);
        return () => modalService.modals.map(renderModal);
    },
});

function renderModal<T extends ModalComponent>(modal: Modal<T>) {
    const props: ModalHandlerProps<ModalResult<T>> = {
        ...modal.props,
        modal: modal.handler,
    };

    const component = h(modal.component, props);
    const wrapper = h(Suspense, null, component);

    return wrapper;
}
