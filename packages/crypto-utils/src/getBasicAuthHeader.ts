export function getBasicAuthHeader(params: { user: string; password: string }): string {
    return `Basic ${Buffer.from(`${params.user}:${params.password}`).toString('base64')}`;
}
