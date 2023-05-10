import { Ref, reactive, ref } from 'vue';

import { defineService } from '@nzyme/ioc';
import { Writable } from '@nzyme/types';
import { CancelError, createPromise } from '@nzyme/utils';

import {
    ModalHandler,
    ModalComponent,
    Modal,
    OpenModalOptions,
    ModalComponentView,
    ModalResult,
    ModalProps,
} from './ModalTypes';

export const ModalService = defineService({
    name: 'ModalService',
    setup() {
        const modals = ref<Modal[]>([]);

        modals.value[0].props;

        return reactive({
            open,
            closeAll,
            modals: modals as Readonly<Ref<readonly Modal[]>>,
        });

        async function open<T extends ModalComponent>(
            options: OpenModalOptions<T>,
        ): Promise<Modal<T>> {
            const open = ref(true);
            const result = createPromise<ModalResult<T>>();

            let modalResult: ModalResult<T> | undefined;
            let modalDone = false;

            const modal = result.promise as Writable<Modal<T>>;

            modal.component = await unwrapModalComponent(options.modal);
            modal.props = options.props as ModalProps<T>;

            modal.handler = {
                setResult(result: ModalResult<T>) {
                    modalResult = result;
                    modalDone = true;
                },
                done(result) {
                    if (!open.value) {
                        return;
                    }

                    modalResult = result;
                    modalDone = true;
                    closeModal();
                },
                close() {
                    if (!open.value) {
                        return;
                    }

                    closeModal();
                },
                cancel() {
                    if (!open.value) {
                        return;
                    }

                    modalResult = undefined;
                    modalDone = false;
                    closeModal();
                },
            };

            modals.value.push(modal as Modal);

            return modal;

            function closeModal() {
                open.value = false;
                modals.value.splice(modals.value.indexOf(modal), 1);

                if (modalDone) {
                    result.resolve(modalResult);
                } else {
                    result.reject(new CancelError());
                }
            }
        }

        function closeAll() {
            modals.value.forEach(m => m.handler.close());
        }
    },
});

async function unwrapModalComponent<T extends ModalComponent>(
    modal: ModalComponentView<T>,
): Promise<T> {
    if (modal instanceof Promise) {
        const view = await modal;
        return view.default;
    }

    if (modal instanceof Function) {
        const view = await modal();
        return view.default;
    }

    return modal;
}
