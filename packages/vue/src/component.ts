import {
    ComponentCustomProps,
    VNodeProps,
    EmitsOptions,
    AllowedComponentProps,
    ObjectEmitsOptions,
} from 'vue';

import { UnionToIntersection } from '@nzyme/types';

declare type PublicProps = VNodeProps & AllowedComponentProps & ComponentCustomProps;

declare type EmitFn<
    Options = ObjectEmitsOptions,
    Event extends keyof Options = keyof Options,
> = Options extends Array<infer V>
    ? (event: V, ...args: any[]) => void
    : {} extends Options
    ? (event: string, ...args: any[]) => void
    : UnionToIntersection<
          {
              [key in Event]: Options[key] extends (...args: infer Args) => any
                  ? (event: key, ...args: Args) => void
                  : (event: key, ...args: any[]) => void;
          }[Event]
      >;

interface ClassComponent<Props, Slots, Emits extends EmitsOptions> {
    $props: Props & PublicProps;
    $slots: Slots;
    $emit: EmitFn<Emits>;
}

export type Component<Props, Slots = {}, Emits extends EmitsOptions = {}> = {
    new (): ClassComponent<Props, Slots, Emits>;
};
