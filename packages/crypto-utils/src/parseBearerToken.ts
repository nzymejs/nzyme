const prefix = 'Bearer ';

export function parseBearerToken(token: string) {
    token = token.trim();

    if (token.startsWith(prefix)) {
        token = token.substring(prefix.length).trim();
    }

    return token;
}
