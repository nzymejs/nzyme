import { createPromise } from './createPromise.js';

type ParalelllRunnerOptions = {
    concurrency: number;
    handler: () => Promise<void | false>;
};

export function createParalellRunner(options: ParalelllRunnerOptions) {
    const { handler, concurrency } = options;

    let promise: ReturnType<typeof createPromise<void>> | undefined;
    let active = 0;
    let done = true;

    return {
        start,
        stop,
        wait,
    };

    async function start() {
        if (!promise) {
            promise = createPromise();
        }

        done = false;

        for (let i = active; i < concurrency; i++) {
            void startThread();
        }

        await promise.promise;
    }

    async function stop() {
        done = true;
        await promise?.promise;
    }

    async function wait() {
        await promise?.promise;
    }

    async function startThread() {
        active++;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (done) {
                stopThread();
                return;
            }

            try {
                const result = await handler();
                if (result === false) {
                    stopThread();
                    return;
                }
            } catch (e) {
                active--;
                done = true;
                promise?.reject(e);
                throw e;
            }
        }
    }

    function stopThread() {
        active--;
        if (active === 0) {
            done = true;
            promise?.resolve();
        }
    }
}
