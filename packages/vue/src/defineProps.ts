import { PropsDefinition } from './types/PropsDefinition.js';

export function defineProps<P extends PropsDefinition>(props: P) {
    return props;
}
