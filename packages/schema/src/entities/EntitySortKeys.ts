import { IfAny, Simplify } from '@nzyme/types';

import { TypeName } from '../Typed.js';
import { ObjectQuery } from '../object/ObjectSchema.js';

import { EntityConfig } from './EntityConfig.js';

export type EntitySortType = string | number | boolean | Date | bigint | unknown;

type EntityNotSortableKeys = 'id' | number | symbol | TypeName;
type EntitySortable<T extends object> = {
    [K in keyof T as T[K] extends EntitySortType ? Exclude<K, EntityNotSortableKeys> : never]: T[K];
};

export type EntitySortKey<T extends EntityConfig> = Simplify<
    // If any is passed as parameter, just return any.
    // Otherwise there are some weird type errors with API definitions.
    IfAny<T, string, Exclude<keyof EntitySortable<ObjectQuery<T>>, undefined>> & string
>;
