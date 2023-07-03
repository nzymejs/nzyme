import { Typed } from './Typed.js';
import { EntityDescriptor } from './entities/EntityDescriptor.js';
import { EntityConfig } from './entities/index.js';
import { ObjectDescriptor, ObjectValue } from './object/ObjectSchema.js';
import { ObjectConfig } from './object/index.js';

export function resolveObjectType<T extends EntityConfig>(
    type: EntityDescriptor<T>,
    value: ObjectValue<T> | null | undefined,
): EntityDescriptor | null;
export function resolveObjectType<T extends EntityConfig>(
    type: EntityDescriptor<T>,
    typename: string,
): EntityDescriptor | null;
export function resolveObjectType<T extends ObjectConfig>(
    type: ObjectDescriptor<T>,
    value: ObjectValue<T> | null | undefined,
): ObjectDescriptor | null;
export function resolveObjectType<T extends ObjectConfig>(
    type: ObjectDescriptor<T>,
    typename: string,
): ObjectDescriptor | null;
export function resolveObjectType(
    type: ObjectDescriptor,
    valueOrType: Typed | string | null | undefined,
): ObjectDescriptor | EntityDescriptor | null {
    if (!valueOrType) {
        return null;
    }

    const typename = typeof valueOrType === 'string' ? valueOrType : valueOrType.__typename;
    if (!typename) {
        return null;
    }

    if (type.abstract) {
        const derived = type.derived.get(typename);
        if (derived) {
            return derived;
        }
    } else if (type.typename === typename) {
        return type;
    }

    return null;
}
