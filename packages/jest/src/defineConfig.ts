import type { Config } from '@jest/types';

export function /* #__PURE__ */ defineConfig<T extends Config.InitialOptions>(config: T) {
    return config;
}
