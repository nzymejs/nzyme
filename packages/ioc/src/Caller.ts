import { defineInjectable } from './Injectable.js';

export const Caller = defineInjectable({
    name: 'Caller',
    resolve: (_container, service) => service,
});
