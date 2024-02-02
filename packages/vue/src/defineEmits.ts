import type { PropsDefinition } from './types/PropsDefinition.js';

export function defineEmits<P extends PropsDefinition>(props: P) {
    return props;
}
