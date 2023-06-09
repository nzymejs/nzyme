import { Ref, defineComponent, h, reactive, ref, ComponentInternalInstance } from 'vue';

import { virtualHistory } from '@nzyme/dom';
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
} from './ModalTypes.js';

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

            modal.id = Symbol('modal');
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

            modal.component = defineComponent({
                async setup() {
                    const props: ModalHandlerProps<ModalResult<T>> = {
                        ...modal.props,
                        modal: modal.handler,
                    };

                    const view = await unwrapModalComponent(options.modal);

                    return () => {
                        if (!open.value) {
                            return null;
                        }

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
                arrayRemove(modals.value, modal as Modal);
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
