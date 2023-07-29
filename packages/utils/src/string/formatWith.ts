const regex = /{\s*(\w*)\s*}/gi;

/**
 * Formats strings with placeholders, like:
 * 'product price {price}'
 * @param template template to format
 * @param params parameters to format with
 * @returns output string
 */
export function formatWith(template: string, params: Record<string, unknown>) {
    return template.replace(regex, (match, key: string) => {
        const value = params[key];
        if (value !== undefined) {
            return String(params[key]);
        }

        return match;
    });
}
