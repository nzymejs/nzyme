import { FetchError } from './FetchError.js';

export async function assertResponse(response: Response) {
    if (!response.ok) {
        const message = await response.text();
        throw new FetchError(response, message);
    }
}
