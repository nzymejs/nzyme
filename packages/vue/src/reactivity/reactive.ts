import { Ref, reactive as reactiveVue } from 'vue';

type ReactiveInput<T extends object> = {
    [K in keyof T]: T[K] | Ref<T[K]>;
};

interface Reactive {
    <T extends object>(value: ReactiveInput<T>): T;
}

export const reactive = reactiveVue as Reactive;
