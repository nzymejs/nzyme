const changesSymbol = Symbol('changes');

type ChangeTracker<T> = T & {
    [changesSymbol]: Partial<T> | null;
};

export function trackObjectChanges<T extends object>(entity: T): ChangeTracker<T> {
    let changes: Partial<T> | null = null;

    const proxy = new Proxy(entity, {
        set(target, prop, value) {
            if (changes === null) {
                changes = {};
            }

            changes[prop as keyof T] = value as T[keyof T];
            target[prop as keyof T] = value as T[keyof T];
            return true;
        },
        get(target, prop) {
            if (prop === changesSymbol) {
                return changes;
            }

            return target[prop as keyof T];
        },
    });

    return proxy as ChangeTracker<T>;
}

export function getObjectChanges<T>(obj: ChangeTracker<T>) {
    return obj[changesSymbol];
}
