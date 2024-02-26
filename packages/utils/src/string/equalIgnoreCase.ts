export function equalIgnoreCase(a: string, b: string) {
    return a.toLowerCase() === b.toLowerCase();
}

export { equalIgnoreCase as equalCaseInsensitive };
