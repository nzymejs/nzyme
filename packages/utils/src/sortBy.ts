export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
    order?: SortOrder | null;
    ignoreCase?: boolean;
}

export function sortBy<T>(array: T[], key: keyof T, options?: SortOptions) {
    const orderDesc = options?.order === 'desc';
    const ignoreCase = options?.ignoreCase || false;

    return array.sort((a, b) => {
        let first = orderDesc ? b[key] : (a[key] as unknown);
        let second = orderDesc ? a[key] : (b[key] as unknown);

        if (typeof first === 'string') {
            if (ignoreCase) {
                first = first.toLocaleLowerCase();
                second = String(second).toLocaleLowerCase();
            }

            return (first as string).localeCompare(second as string);
        } else if (first == second) {
            return 0;
        } else if (first == null) {
            return -1;
        } else if (second == null) {
            return 1;
        } else if ((first as number) < (second as number)) {
            return -1;
        }

        return 1;
    });
}
