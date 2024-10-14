export const CHARS_NUMBERS = '0123456789';
export const CHARS_LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
export const CHARS_UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const CHARS_LETTERS = CHARS_LOWERCASE + CHARS_UPPERCASE;
export const CHARS_BASE36 = CHARS_NUMBERS + CHARS_LOWERCASE;

export function randomString(length: number, characters: string = CHARS_BASE36) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
