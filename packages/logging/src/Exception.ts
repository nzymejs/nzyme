export type ExceptionOptions = {
    cause?: unknown;
    [key: string]: unknown;
};

export class Exception extends Error {
    constructor(
        message: string,
        public readonly attrs?: ExceptionOptions,
    ) {
        super(message, {
            cause: attrs?.cause,
        });

        this.name = 'Exception';
    }
}
