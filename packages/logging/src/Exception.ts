export class Exception extends Error {
    constructor(
        message: string,
        public readonly attrs?: Record<string, unknown>,
    ) {
        super(message);
        this.name = 'Exception';
    }
}
