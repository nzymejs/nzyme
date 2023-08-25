type QueryParamValue = string | null;
export type QueryParam = QueryParamValue | QueryParamValue[];
export type QueryParams = Record<string, QueryParam | undefined>;

export function stringifyQuery(params: QueryParams) {
    let qs = '';

    for (const key of Object.keys(params)) {
        const value = params[key];
        if (Array.isArray(value)) {
            for (const val of value) {
                qs = appendQueryString(qs, key, val);
            }
        } else {
            qs = appendQueryString(qs, key, value);
        }
    }

    if (qs) {
        qs = '?' + qs;
    }

    return qs;
}

function appendQueryString(qs: string, key: string, value: string | null | undefined) {
    if (value == null) {
        return qs;
    }

    if (qs.length) {
        qs += '&';
    }

    qs += `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;

    return qs;
}
