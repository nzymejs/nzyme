import type { ComponentOptions } from 'vue';

import type { EmptyObject, Flatten } from '@nzyme/types';

import type { ComponentProps } from '../types/ComponentProps.js';

export type ModalHandlerProps<TResult> = {
    modal: ModalHandler<TResult>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModalComponent<TProps extends ModalHandlerProps<any> = any> = ComponentOptions<TProps>;

export type ModalComponentView<T extends ModalComponent> =
    | T
    | (() => Promise<{ default: T }>)
    | Promise<{ default: T }>;

type ModalPropsWithoutHandler<T extends ModalComponent> = Flatten<Omit<ComponentProps<T>, 'modal'>>;

export type ModalProps<T extends ModalComponent> = keyof ModalPropsWithoutHandler<T> extends never
    ? undefined
    : ModalPropsWithoutHandler<T>;

export type ModalResult<T extends ModalComponent> = ComponentProps<T> extends ModalHandlerProps<
    infer R
>
    ? R
    : void;

export interface ModalHandler<T = unknown> {
    setResult(this: void, result: T): void;
    done(this: void, result: T): void;
    close(this: void): void;
    cancel(this: void): void;
    readonly open: boolean;
}

export type OpenModalOptions<T extends ModalComponent = ModalComponent> = ModalProps<T> extends void
    ? OpenModalOptionsWithoutProps<T>
    : OpenModalOptionsWithProps<T>;

type OpenModalOptionsBase<T extends ModalComponent = ModalComponent> = {
    /**
     * Modal component to be opened.
     * Supports asynchronous components loaded with `import(...)`.
     */
    modal: ModalComponentView<T>;
};

interface OpenModalOptionsWithoutProps<T extends ModalComponent> extends OpenModalOptionsBase<T> {
    props?: undefined | EmptyObject;
}

interface OpenModalOptionsWithProps<T extends ModalComponent> extends OpenModalOptionsBase<T> {
    /** Props to pass to the modal. */
    props: ModalProps<T>;
}

export interface Modal<T extends ModalComponent = ModalComponent>
    extends Promise<ModalResult<T> | undefined> {
    readonly id: symbol;
    readonly handler: ModalHandler<ModalResult<T>>;
    readonly props: ModalProps<T>;
    readonly component: ComponentOptions;
}
