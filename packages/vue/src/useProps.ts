import type { ExtractPropTypes } from 'vue';

import { useInstance } from './useInstance.js';

export function useProps(): Record<string, unknown>;
export function useProps<P>(propsDef: P): ExtractPropTypes<P>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useProps(propsDef?: unknown) {
    return useInstance().props;
}
