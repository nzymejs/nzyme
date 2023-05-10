import { defineService } from '@nzyme/ioc';
import { Ref, reactive, ref } from 'vue';
import { CancelError, createPromise } from '@nzyme/utils';

import {
    ModalHandler,
    ModalComponent,
    Modal,
    OpenModalOptions,
    ModalComponentView,
    ModalResult,
} from './ModalTypes';

export const ModalService = defineService({
    name: 'ModalService',
    setup() {
        const modals = ref<Modal[]>([]);

        return reactive({
            open,
            closeAll,
            modals: modals as Readonly<Ref<readonly Modal[]>>,
        });

        async function open<T extends ModalComponent>(options: OpenModalOptions<T>) {
            const open = ref(true);
            const result = createPromise<ModalResult<T>>();

            let modalResult: ModalResult<T> | undefined;
            let modalDone = false;

            const handler: ModalHandler<ModalResult<T>> = {
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

            const modal: Modal = {
                component: await unwrapModalComponent(options.modal),
                props: options.props ?? {},
                handler,
                promise: result.promise,
            };

            modals.value.push(modal);

            return modal;

            function closeModal() {
                open.value = false;
                modals.value.splice(modals.value.indexOf(modal), 1);

                if (modalDone) {
                    result.resolve(modalResult as ModalResult<T>);
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
): Promise<ModalComponent> {
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
