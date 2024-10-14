import type { ExtractPropTypes } from 'vue';

import { useInstance } from './useInstance.js';

export function useProps(): Record<string, unknown>;
export function useProps<P>(propsDef: P): ExtractPropTypes<P>;
export function useProps() {
    return useInstance().props;
}
