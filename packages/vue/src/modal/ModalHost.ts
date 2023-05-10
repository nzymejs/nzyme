import { defineComponent, inject } from 'vue';

import { ModalService } from './ModalService';

export const ModalHost = defineComponent({
    setup(props, ctx) {
        const modalService = inject(ModalService.symbol);

        return () => {
            return undefined;
        };
    },
});
