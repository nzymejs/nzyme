import type { Container } from './Container.js';

export type Module<TParams extends unknown[]> = {
    (container: Container, ...params: TParams): void;
};

export function defineModule<TParams extends unknown[]>(module: Module<TParams>) {
    return module;
}
