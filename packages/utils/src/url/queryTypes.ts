type QueryParamValue = string | null;
export type QueryParam = QueryParamValue | QueryParamValue[];
export type QueryParams = Record<string, QueryParam | undefined>;
export type QueryParamsSimple = Record<string, string | undefined | null>;
