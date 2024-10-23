import type {
    ComponentCustomProps,
    VNodeProps,
    EmitsOptions,
    AllowedComponentProps,
    ObjectEmitsOptions,
} from 'vue';

import type { UnionToIntersection } from '@nzyme/types';

declare type PublicProps = VNodeProps & AllowedComponentProps & ComponentCustomProps;

declare type EmitFn<Options = ObjectEmitsOptions, Event extends keyof Options = keyof Options> =
    Options extends Array<infer V>
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (event: V, ...args: any[]) => void
        : // eslint-disable-next-line @typescript-eslint/no-empty-object-type
          {} extends Options
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (event: string, ...args: any[]) => void
          : UnionToIntersection<
                {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    [key in Event]: Options[key] extends (...args: infer Args) => any
                        ? (event: key, ...args: Args) => void
                        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (event: key, ...args: any[]) => void;
                }[Event]
            >;

interface ClassComponent<Props, Slots, Emits extends EmitsOptions> {
    $props: Props & PublicProps;
    $slots: Slots;
    $emit: EmitFn<Emits>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Component<Props = {}, Slots = {}, Emits extends EmitsOptions = {}> = {
    new (): ClassComponent<Props, Slots, Emits>;
};
