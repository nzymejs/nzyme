const styles: { [key: string]: Promise<void> | undefined } = {};

export function loadStyles(url: string, options?: { document?: Document }) {
    if (styles[url]) {
        return styles[url];
    }

    const doc = options?.document ?? document;
    const css = doc.createElement('link');

    return new Promise<void>((resolve, reject) => {
        css.rel = 'stylesheet';
        css.type = 'text/css';
        css.href = url;

        if (typeof css.onload != 'undefined') {
            css.onload = () => resolve();
            css.onerror = () => {
                doc.head.removeChild(css);
                reject();
            };
            doc.head.appendChild(css);
        } else {
            // A hack for cross-browser support.
            // Some older browsers do not support onload event,
            // https://stackoverflow.com/a/56310332/2202583
            const img = doc.createElement('img');
            img.onerror = () => {
                resolve();
                doc.body.removeChild(img);
            };
            img.src = url;

            doc.head.appendChild(css);
            doc.body.appendChild(img);
        }
    });
}
