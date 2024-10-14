export function jsonResponse<T>(response: Response) {
    return response.json() as Promise<T>;
}
