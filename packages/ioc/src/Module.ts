import type { Container } from './Container.js';

export type Module<TParams extends unknown[], TResult> = {
    (container: Container, ...params: TParams): TResult;
};

/*#__NO_SIDE_EFFECTS__*/
export function defineModule<TParams extends unknown[], TResult>(module: Module<TParams, TResult>) {
    return module;
}
