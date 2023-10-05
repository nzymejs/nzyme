import { PropType } from 'vue';

export const classProp = [String, Object, Array] as PropType<
    string | Record<string, boolean> | Array<string> | undefined
>;
