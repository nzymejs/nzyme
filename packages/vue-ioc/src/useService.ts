import type { Interface } from '@nzyme/ioc';

import { useContainer } from './useContainer.js';

export function useService<T>(service: Interface<T>): T {
    return useContainer().resolve(service);
}
