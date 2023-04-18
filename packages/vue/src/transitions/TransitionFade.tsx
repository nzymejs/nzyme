import css from './TransitionFade.module.scss';
import { defineTransition } from './defineTransition';

export const TransitionFade = defineTransition({
    enterFromClass: css.fadeInactive,
    leaveToClass: css.fadeInactive,
    enterActiveClass: css.fadeActive,
    leaveActiveClass: css.fadeActive,
});