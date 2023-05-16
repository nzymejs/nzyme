import { computed, getCurrentInstance, Ref } from 'vue';

export function useElement<T extends Element>(): Readonly<Ref<T | undefined>> {
    const vm = getCurrentInstance()?.proxy;

    return computed(() => vm?.$el as T | undefined) as Readonly<Ref<T | undefined>>;
}
