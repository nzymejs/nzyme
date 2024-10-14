export class FetchError extends Error {
    public readonly status: number;
    public readonly url: string;

    constructor(
        public readonly response: Response,
        message?: string,
    ) {
        super(message || response.statusText);
        this.url = response.url;
        this.status = response.status;
    }
}
