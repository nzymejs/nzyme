import { PropType } from 'vue';

type ClassType = string | boolean | object | number | null | undefined;

export const classProp = [String, Object, Array] as PropType<
    ClassType | Record<string, boolean> | Array<ClassType>
>;
