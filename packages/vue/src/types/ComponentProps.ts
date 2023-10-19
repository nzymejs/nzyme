import { ComponentPublicInstance, VNodeProps, AllowedComponentProps } from 'vue';

import { Constructor } from '@nzyme/types';

export type ComponentProps<T> = T extends Constructor<ComponentPublicInstance>
    ? Omit<InstanceType<T>['$props'], keyof VNodeProps | keyof AllowedComponentProps>
    : void;
