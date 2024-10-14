import type { ExtractPropTypes, PropType } from 'vue';

import css from './TransitionSlide.module.scss';
import { defineTransition } from './defineTransition.js';

const transitionProps = {
    direction: {
        type: String as PropType<'top' | 'bottom' | 'left' | 'right'>,
        default: 'bottom',
    },
    fade: Boolean,
};

export const TransitionSlide = defineTransition({
    name: 'TransitionSlide',
    props: transitionProps,
    enterFromClass: inactiveClass,
    leaveToClass: inactiveClass,
    enterActiveClass: activeClass,
    leaveActiveClass: activeClass,
});

function inactiveClass(props: ExtractPropTypes<typeof transitionProps>) {
    return props.fade
        ? css[`fadeInactive_${props.direction}`]
        : css[`slideInactive_${props.direction}`];
}

function activeClass(props: ExtractPropTypes<typeof transitionProps>) {
    return props.fade ? css.fadeActive : css.slideActive;
}
