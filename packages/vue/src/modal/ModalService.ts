import { Ref, defineComponent, h, ref, ComponentInternalInstance } from 'vue';

import { clearFocus, virtualHistory } from '@nzyme/dom';
import { defineService } from '@nzyme/ioc';
import { Writable } from '@nzyme/types';
import { CancelError, arrayRemove, assertValue, createPromise } from '@nzyme/utils';

import {
    ModalComponent,
    Modal,
    OpenModalOptions,
    ModalResult,
    ModalProps,
    ModalComponentView,
    ModalHandlerProps,
    ModalHandler,
} from './ModalTypes.js';
import { reactive } from '../reactivity/reactive.js';

interface ModalServiceOpenOptions {
    /**
     * To make context-based features like provide/inject work, you need to pass parent component instance
     */
    parent?: ComponentInternalInstance | null;
}

export const ModalService = defineService({
    name: 'ModalService',
    setup() {
        const modals = ref<Modal[]>([]);

        return reactive({
            open,
            closeAll,
            modals: modals as Readonly<Ref<readonly Modal[]>>,
        });

        function open<T extends ModalComponent>(
            options: OpenModalOptions<T> & ModalServiceOpenOptions,
        ): Modal<T> {
            const open = ref(true);
            const result = createPromise<ModalResult<T>>();

            let modalResult: ModalResult<T> | undefined;
            let modalDone = false;

            const modal = result.promise as Writable<Modal<T>>;
            const historyHandle = virtualHistory.pushState(() => modal.handler.cancel());

            // When modal is opened, we want to clear focus from the previously focused element.
            clearFocus();

            modal.id = Symbol('modal');
            modal.props = options.props as ModalProps<T>;
            modal.handler = reactive<ModalHandler<ModalResult<T>>>({
                open,
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
            });

            modal.component = defineComponent({
                async setup() {
                    const props: ModalHandlerProps<ModalResult<T>> = {
                        ...modal.props,
                        modal: modal.handler,
                    };

                    const view = await unwrapModalComponent(options.modal);

                    return () => {
                        const vnode = h(view, props);
                        if (options.parent) {
                            vnode.appContext = { ...options.parent.appContext };
                        }

                        return vnode;
                    };
                },
            });

            modals.value.push(modal as Modal);

            return modal;

            function closeModal() {
                open.value = false;

                // Give some time to perform animations
                setTimeout(() => arrayRemove(modals.value, modal as Modal), 1000);

                historyHandle.cancel();

                if (modalDone) {
                    result.resolve(assertValue(modalResult));
                } else {
                    result.reject(new CancelError());
                }
            }
        }

        function closeAll() {
            modals.value.forEach(m => m.handler.close());
        }

        function unwrapModalComponent<T extends ModalComponent>(modal: ModalComponentView<T>) {
            if (modal instanceof Promise) {
                return modal.then(view => view.default);
            }

            if (modal instanceof Function) {
                return modal().then(view => view.default);
            }

            return Promise.resolve(modal);
        }
    },
});
