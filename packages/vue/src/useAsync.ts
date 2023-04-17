import { Ref, ref } from 'vue';

export function useAsync<T>(fcn: () => Promise<T>): Ref<T | null> {
    const reference: Ref<T | null> = ref(null);

    void fcn().then(result => {
        reference.value = result;
    });

    return reference;
}
