import { CancelError, assertValue, createPromise } from '@nzyme/utils';
import { ref, onUnmounted, getCurrentInstance, defineComponent, h, createApp, Suspense } from 'vue';

import { prop } from '../prop.js';
import { useVirtualHistory } from '../useVirtualHistory.js';

import {
    ModalComponent,
    ModalComponentView,
    ModalHandler,
    ModalHandlerProps,
    ModalProps,
    ModalResult,
    OpenModalOptions,
} from './ModalTypes.js';

const allModals: ModalHandler<unknown>[] = [];

export function useModalProps<T = void>() {
    return {
        modal: prop<ModalHandler<T>>().required(),
    };
}

interface ModalOptions {
    /**
     * Close all open modals when component is unmounted.
     * By default true
     */
    closeOnUnmounted?: boolean;
}

export function useModal(opts?: ModalOptions) {
    const currentInstance = assertValue(getCurrentInstance());
    const virtualHistory = useVirtualHistory();

    const localModals: ModalHandler<unknown>[] = [];

    const closeOnUnmounted = opts?.closeOnUnmounted ?? true;

    if (closeOnUnmounted) {
        onUnmounted(() => {
            localModals.forEach(m => m.close());
        });
    }

    return {
        async open<T extends ModalComponent>(options: OpenModalOptions<T>) {
            const view = await unwrapModalComponent(options.modal);
            const promise = createPromise<ModalResult<T>>();
            const open = ref(true);

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
                    void closeModal();
                },
                close() {
                    if (!open.value) {
                        return;
                    }

                    void closeModal();
                },
            };

            localModals.push(handler);
            allModals.push(handler);

            const historyHandle = virtualHistory.pushState(handler.close);

            const componentPromise = createPromise();
            const component = defineComponent({
                setup() {
                    onUnmounted(() => {
                        if (open.value) {
                            // modal is still open, there is some v-if in the modal component
                            return;
                        }

                        componentPromise.resolve();
                    });

                    return () => {
                        if (!open.value) {
                            return null;
                        }

                        const props: ModalHandlerProps<ModalResult<T>> = {
                            modal: handler,
                        };

                        if (options.props) {
                            Object.assign(props, options.props);
                        }

                        const node = h(view, props);

                        return h(Suspense, null, node);
                    };
                },
            });

            const app = createApp(component);
            Object.assign(app._context, currentInstance.appContext);

            const host = document.createElement('div');
            host.role = 'dialog';
            document.body.appendChild(host);
            app.mount(host);

            // const vnode = createVNode(component);
            // vnode.appContext = { ...currentInstance.appContext };
            // render(vnode, document.body);

            async function closeModal() {
                open.value = false;

                // remove it from modal queue
                localModals.splice(localModals.indexOf(handler), 1);
                allModals.splice(allModals.indexOf(handler), 1);

                historyHandle.cancel();

                await componentPromise.promise;

                app.unmount();
                host.remove();

                if (modalDone) {
                    promise.resolve(modalResult as ModalResult<T>);
                } else {
                    promise.reject(new CancelError());
                }
            }

            return await promise.promise;
        },
        closeAll() {
            allModals.forEach(m => m.close());
        },
    };
}

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
