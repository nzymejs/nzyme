import css from './TransitionBump.module.scss';
import { defineTransition } from './defineTransition.js';

export const TransitionBump = defineTransition({
    name: 'TransitionBump',
    enterFromClass: css.bumpInactive,
    leaveToClass: css.bumpInactive,
    enterActiveClass: css.bumpActive,
    leaveActiveClass: css.bumpActive,
});
