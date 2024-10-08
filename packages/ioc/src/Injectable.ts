declare const s: unique symbol;

export class Injectable<T = unknown> {
    declare [s]: T;

    public readonly name?: string;
    public readonly symbol = Symbol();

    constructor(options?: InjectableOptions) {
        this.name = options?.name;
    }
}

export type InjectableOf<T> = T extends Injectable<infer U> ? U : never;

export interface InjectableOptions {
    name?: string;
}

/*#__NO_SIDE_EFFECTS__*/
export function defineInjectable<T>(options?: InjectableOptions) {
    return new Injectable<T>(options);
}
