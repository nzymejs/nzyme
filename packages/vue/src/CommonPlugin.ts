import type { Plugin } from 'vue';

import type { VueContainer } from './createContainer.js';
import { containerSymbol } from './useContainer.js';

export interface CommonPluginOptions {
    container: VueContainer;
}

export const CommonPlugin: Plugin<CommonPluginOptions> = {
    install(app, options: CommonPluginOptions) {
        app.provide(containerSymbol, options.container);
    },
};
