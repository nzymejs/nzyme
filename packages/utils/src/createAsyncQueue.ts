export function createAsyncQueue() {
    type QueueItem = {
        fn: () => Promise<unknown>;
        resolve: () => void;
        reject: (error: Error) => void;
    };

    const queue: QueueItem[] = [];

    return {
        enqueue,
    };

    function enqueue(fn: () => Promise<unknown>) {
        return new Promise<void>((resolve, reject) => {
            queue.push({ fn, resolve, reject });
            if (queue.length === 1) {
                processNext();
            }
        });
    }

    function processNext() {
        const item = queue.shift();
        if (!item) {
            return;
        }

        item.fn().then(item.resolve).catch(item.reject).finally(processNext);
    }
}
