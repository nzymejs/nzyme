import { defineComponent, getCurrentInstance, Transition, withDirectives, vShow } from 'vue';

import { prop } from '../prop';

import css from './Collapse.module.scss';
import { LazyHydrate } from './LazyHydrate';

// Used to easily debug complex transition problems.
const DEBUG = false;

export const Collapse = defineComponent({
    name: 'Collapse',
    props: {
        lazy: prop(Boolean).optional(),
        show: prop(Boolean).optional(),
    },
    setup(props, ctx) {
        const vm = getCurrentInstance();
        const lazyHydrate =
            props.lazy &&
            // There is no need to lazy load if it's shown from the start.
            !props.show &&
            // Check if we are during hydration process.
            vm?.vnode.el != null;

        const Inner = () => {
            const inner = <div class={css.collapse}>{ctx.slots.default?.()}</div>;
            return withDirectives(inner, [[vShow, props.show]]);
        };

        return () => {
            const collapse = (
                <Transition
                    enterFromClass={css.enterFrom}
                    enterActiveClass={css.enterActive}
                    leaveFromClass={css.leaveFrom}
                    leaveActiveClass={css.leaveActive}
                    onBeforeEnter={beforeEnter}
                    onEnter={enter}
                    onAfterEnter={afterEnter}
                    onLeave={leave}
                    onAfterLeave={afterLeave}
                    appear={lazyHydrate}
                >
                    <Inner />
                </Transition>
            );

            if (lazyHydrate) {
                return <LazyHydrate whenTriggered={props.show}>{collapse}</LazyHydrate>;
            }

            return collapse;
        };

        function beforeEnter(el: Element) {
            if (DEBUG) console.warn('beforeEnter', el);
            zeroHeight(el as HTMLElement);
        }

        function enter(el: Element) {
            if (DEBUG) console.warn('enter', el);
            fixedHeight(el as HTMLElement);
            ctx.emit('heightChange', el.scrollHeight);
        }

        function afterEnter(el: Element) {
            if (DEBUG) console.warn('afterEnter', el);
            autoHeight(el as HTMLElement);
            ctx.emit('afterEnter');
        }

        function leave(el: Element) {
            if (DEBUG) console.warn('leave', el);
            fixedHeight(el as HTMLElement);

            requestAnimationFrame(() => {
                zeroHeight(el as HTMLElement);
                ctx.emit('heightChange', 0);
            });
        }

        function afterLeave(el: Element) {
            if (DEBUG) console.warn('afterLeave', el);
            autoHeight(el as HTMLElement);
        }

        function fixedHeight(el: HTMLElement) {
            el.style.height = `${el.scrollHeight}px`;
            el.style.overflow = 'hidden';
            if (DEBUG) console.warn('fixedHeight', el);
            forceRepaint(el);
        }

        function autoHeight(el: HTMLElement) {
            el.style.overflow = '';
            el.style.height = '';
            if (DEBUG) console.warn('autoHeight', el);
            forceRepaint(el);
        }

        function zeroHeight(el: HTMLElement) {
            el.style.height = '0';
            if (DEBUG) console.warn('zeroHeight', el);
            forceRepaint(el);
        }

        function forceRepaint(el: Element) {
            // Force repaint to make sure the
            // animation is triggered correctly.
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            const height = getComputedStyle(el).height;
            if (DEBUG) console.warn('forceRepaint', el, height);
        }
    },
});
