const scripts: { [key: string]: Promise<void> | undefined } = {};

/**
 * Loads a given script into the page.
 * If script was already loaded, it won't load it again
 */
export function loadScript(url: string) {
    if (scripts[url]) {
        return scripts[url];
    }

    const scriptTag = document.createElement('script');

    return new Promise<void>((resolve, reject) => {
        scriptTag.src = url;
        scriptTag.onload = () => resolve();
        scriptTag.onerror = () => {
            document.body.removeChild(scriptTag);
            reject();
        };
        document.body.appendChild(scriptTag);
    });
}
