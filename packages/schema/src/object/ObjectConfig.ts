import { ConfigDefault, SomeObject } from '@nzyme/types';

import { ObjectProps } from './ObjectProps.js';

export type ObjectKind = 'abstract' | 'sealed' | 'open';

export interface ObjectConfig {
    type: string;
    props: ObjectProps;
    meta: ObjectProps;
    kind: ObjectKind;
}

export type ObjectConfigDefault<T extends Partial<ObjectConfig> = {}> = ConfigDefault<
    ObjectConfig,
    T,
    { type: string; props: SomeObject; meta: SomeObject; kind: ObjectKind }
>;
