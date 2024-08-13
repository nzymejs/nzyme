import { type ExtractPropTypes, type Prop, computed } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
/*#__NO_SIDE_EFFECTS__*/
export function defineVModel<K extends string, P extends Prop<any>>(prop: K, options: P) {
    type PropsDef = {
        readonly [KK in K]: P;
    };

    type Props = ExtractPropTypes<PropsDef>;

    type PropValue = K extends keyof Props ? Props[K] : never;

    type Emits = {
        readonly [KK in K as `update:${KK}`]: (value: PropValue) => boolean;
    };

    return {
        props: { [prop]: options } as PropsDef,
        emits: undefined as unknown as Emits,
        setup,
    };

    function setup(props: Props, emit: (event: `update:${K}`, value: PropValue) => void) {
        return computed({
            get: () => props[prop as keyof Props],
            set: value => emit(`update:${prop}`, value as unknown as PropValue),
        });
    }
}
