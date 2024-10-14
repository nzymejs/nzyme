import css from './TransitionFade.module.scss';
import { defineTransition } from './defineTransition.js';

export const TransitionFade = defineTransition({
    name: 'TransitionFade',
    enterFromClass: css.fadeInactive,
    leaveToClass: css.fadeInactive,
    enterActiveClass: css.fadeActive,
    leaveActiveClass: css.fadeActive,
});
