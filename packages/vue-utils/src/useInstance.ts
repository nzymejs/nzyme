import { getCurrentInstance } from 'vue';

export function useInstance() {
    const instance = getCurrentInstance();
    if (!instance) {
        throw new Error('Must be called in setup() function');
    }

    return instance;
}

export function useInstanceProxy() {
    const instance = useInstance();
    if (!instance.proxy) {
        throw new Error('Instance proxy not set');
    }

    return instance.proxy;
}
