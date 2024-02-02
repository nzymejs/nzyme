import type { App as AppImport } from 'vue';

import { defineInjectable } from '@nzyme/ioc';

export const App = defineInjectable<AppImport>({
    name: 'App',
});

export type App = AppImport;
