import { Plugin } from 'vue';

import { Container } from '@nzyme/ioc';

import { containerSymbol } from './useContainer';

export interface CommonPluginOptions {
    container: Container;
}

export const CommonPlugin: Plugin = {
    install(app, options: CommonPluginOptions) {
        app.provide(containerSymbol, options.container);
    },
};
