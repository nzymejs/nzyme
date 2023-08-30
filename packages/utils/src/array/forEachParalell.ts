type ForEachParalellParams<T> = {
    callback: (item: T) => Promise<void>;
    concurrency: number;
};

/**
 * Runs a callback for each item in an array in parallel.
 */
export function forEachParalell<T>(array: readonly T[], params: ForEachParalellParams<T>) {
    return new Promise<void>((resolve, reject) => {
        const { callback, concurrency } = params;
        let index = 0;
        let active = 0;
        let done = false;

        for (let i = 0; i < concurrency; i++) {
            void start();
        }

        async function start() {
            active++;

            // eslint-disable-next-line no-constant-condition
            while (true) {
                if (done) {
                    return;
                }

                if (index >= array.length) {
                    active--;

                    if (active === 0) {
                        done = true;
                        resolve();
                    }
                    return;
                }

                const item = array[index++];
                try {
                    await callback(item);
                } catch (e) {
                    done = true;
                    reject(e);
                }
            }
        }
    });
}