export function localStorageSetJson<T>(key: string, value: T) {
    if(typeof localStorage === 'undefined') {
        return;
    }

    const json = JSON.stringify(value);
    localStorage.setItem(key, json);
}

export function localStorageGetJson<T>(key: string): T | null {
    if(typeof localStorage === 'undefined') {
        return null;
    }

    const json = localStorage.getItem(key);
    if (!json) {
        return null;
    }

    return JSON.parse(json) as T;
}
