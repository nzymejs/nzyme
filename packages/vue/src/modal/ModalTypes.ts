import { Flatten } from '@nzyme/types';
import { DefineComponent, ExtractPropTypes, ComponentOptions } from 'vue';

export type ModalHandlerProps<TResult> = {
    modal: ModalHandler<TResult>;
};

type ComponentProps<T> = T extends DefineComponent<infer TProps, any, any, any>
    ? ExtractPropTypes<TProps>
    : never;

export type ModalComponent<TProps extends ModalHandlerProps<any> = any> = ComponentOptions<TProps>;

export type ModalComponentView<T extends ModalComponent> =
    | T
    | (() => Promise<{ default: T }>)
    | Promise<{ default: T }>;

type ModalPropsWithoutHandler<T extends ModalComponent> = Flatten<Omit<ComponentProps<T>, 'modal'>>;
export type ModalProps<T extends ModalComponent> = keyof ModalPropsWithoutHandler<T> extends never
    ? void
    : ModalPropsWithoutHandler<T>;

export type ModalResult<T extends ModalComponent> = T extends ModalComponent<infer TProps>
    ? TProps['modal'] extends ModalHandler<infer TResult>
        ? TResult
        : never
    : never;

export interface ModalHandler<T> {
    setResult(this: void, result: T): void;
    done(this: void, result: T): void;
    close(this: void): void;
    cancel(this: void): void;
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

export interface Modal {
    handler: ModalHandler<unknown>;
    props: Record<string, unknown>;
    component: ModalComponent;
    promise: Promise<unknown>;
}
