/** Utility class to easily create configs */
export abstract class Config<T> {
    constructor(config: T) {
        Object.assign(this, config);
    }
}

export function configClass<T>() {
    return Config<T> as { new (config: T): T };
}
