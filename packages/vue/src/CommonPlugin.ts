import type { Plugin } from 'vue';

import { Container } from '@nzyme/ioc';

import { containerSymbol } from './useContainer.js';

export interface CommonPluginOptions {
    container: Container;
}

export const CommonPlugin: Plugin<CommonPluginOptions> = {
    install(app, options: CommonPluginOptions) {
        app.provide(containerSymbol, options.container);
    },
};
