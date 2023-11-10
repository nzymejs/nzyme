import type { ComponentPublicInstance, VNodeProps, AllowedComponentProps } from 'vue';

import type { Constructor } from '@nzyme/types';

export type ComponentProps<T> = T extends Constructor<ComponentPublicInstance>
    ? Omit<InstanceType<T>['$props'], keyof VNodeProps | keyof AllowedComponentProps>
    : void;
