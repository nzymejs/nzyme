import type { Config } from '@jest/types';

/*#__NO_SIDE_EFFECTS__*/
export function defineConfig<T extends Config.InitialOptions>(config: T) {
    return config;
}
