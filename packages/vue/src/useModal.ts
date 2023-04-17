import { Flatten } from '@nzyme/types';
import { CancelError, assertValue, createPromise } from '@nzyme/utils';
import {
    ref,
    onUnmounted,
    DefineComponent,
    getCurrentInstance,
    defineComponent,
    h,
    render,
    createVNode,
    ExtractPropTypes,
    ComponentOptions,
    Suspense,
} from 'vue';

import { prop } from './prop';
import { useVirtualHistory } from './useVirtualHistory';

type ModalHandlerProps<TResult> = {
    modal: ModalHandler<TResult>;
};

type ComponentProps<T> = T extends DefineComponent<infer TProps, any, any, any>
    ? ExtractPropTypes<TProps>
    : never;

type ModalComponent<TProps extends ModalHandlerProps<any> = any> = ComponentOptions<TProps>;

type ModalComponentView<T extends ModalComponent> =
    | T
    | (() => Promise<{ default: T }>)
    | Promise<{ default: T }>;

type ModalPropsWithoutHandler<T extends ModalComponent> = Flatten<Omit<ComponentProps<T>, 'modal'>>;
type ModalProps<T extends ModalComponent> = keyof ModalPropsWithoutHandler<T> extends never
    ? void
    : ModalPropsWithoutHandler<T>;

type ModalResult<T extends ModalComponent> = T extends ModalComponent<infer TProps>
    ? TProps['modal'] extends ModalHandler<infer TResult>
        ? TResult
        : never
    : never;

export interface ModalHandler<T> {
    setResult(this: void, result: T): void;
    done(this: void, result: T): void;
    close(this: void): void;
}

const allModals: ModalHandler<unknown>[] = [];

export function useModalProps<T = void>() {
    return {
        modal: prop<ModalHandler<T>>().required(),
    };
}

export type OpenModalOptions<T extends ModalComponent> = ModalProps<T> extends void
    ? OpenModalOptionsWithoutProps<T>
    : OpenModalOptionsWithProps<T>;

interface OpenModalOptionsWithoutProps<T extends ModalComponent> {
    modal: ModalComponentView<T>;
    props?: void;
}

interface OpenModalOptionsWithProps<T extends ModalComponent> {
    modal: ModalComponentView<T>;
    props: ModalProps<T>;
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
        xxx<T extends ModalComponent>(options: OpenModalOptions<T>): ComponentProps<T> {
            return options.modal as any;
        },
        async open<T extends ModalComponent>(options: OpenModalOptions<T>) {
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

            const view = await unwrapModalComponent(options.modal);

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

            const vnode = createVNode(component);
            vnode.appContext = { ...currentInstance.appContext };

            const host = document.createElement('div');
            host.role = 'dialog';
            document.body.appendChild(host);

            render(vnode, document.body);

            async function closeModal() {
                open.value = false;

                // remove it from modal queue
                localModals.splice(localModals.indexOf(handler), 1);
                allModals.splice(allModals.indexOf(handler), 1);

                historyHandle.cancel();

                await componentPromise.promise;
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
