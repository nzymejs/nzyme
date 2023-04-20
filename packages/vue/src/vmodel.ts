import { prop } from './prop.js';

export function vueModelProps<T, TModel extends string = 'modelValue'>(name?: TModel) {
    if (!name) {
        name = 'modelValue' as TModel;
    }

    const modelProp = prop<T>().optional();

    return { [name]: modelProp } as { [key in TModel]: typeof modelProp };
}

export interface VueModelEmits<T, TModel extends string = 'modelValue'> {
    (event: `update:${TModel}`, value: T): void;
}
