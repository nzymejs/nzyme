import { defineComponent, getCurrentInstance, h, Transition, withDirectives } from 'vue';

import { isBrowser } from '@nzyme/dom';

import css from './Collapse.module.scss';
import { LazyHydrate } from './LazyHydrate.js';
import { vShow } from '../directives/vShow.js';
import { prop } from '../prop.js';

// Used to easily debug complex transition problems.
const DEBUG = false;

export const Collapse = defineComponent({
    name: 'Collapse',
    props: {
        render: prop<'always' | 'lazy'>().optional(),
        show: prop(Boolean).optional(),
    },
    emits: {
        heightChange: (height: number) => true,
        afterEnter: () => true,
        afterLeave: () => true,
    },
    setup(props, ctx) {
        const vm = getCurrentInstance();
        const lazyHydrate =
            props.render === 'always' ||
            (props.render === 'lazy' &&
                // There is no need to lazy load if it's shown from the start.
                !props.show &&
                // Check if we are on SSR or hydration process.
                (vm?.vnode.el != null || !isBrowser()));

        const Inner = () => {
            if (lazyHydrate) {
                const inner = <div class={css.collapse}>{ctx.slots.default?.()}</div>;
                return withDirectives(inner, [[vShow, props.show]]);
            }

            if (props.show) {
                return <div class={css.collapse}>{ctx.slots.default?.()}</div>;
            }

            return null;
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
            if (DEBUG) {
                console.warn('beforeEnter', el);
            }
            zeroHeight(el as HTMLElement);
        }

        function enter(el: Element) {
            if (DEBUG) {
                console.warn('enter', el);
            }
            fixedHeight(el as HTMLElement);
            ctx.emit('heightChange', el.scrollHeight);
        }

        function afterEnter(el: Element) {
            if (DEBUG) {
                console.warn('afterEnter', el);
            }
            autoHeight(el as HTMLElement);
            ctx.emit('afterEnter');
        }

        function leave(el: Element) {
            if (DEBUG) {
                console.warn('leave', el);
            }
            fixedHeight(el as HTMLElement);

            requestAnimationFrame(() => {
                zeroHeight(el as HTMLElement);
                ctx.emit('heightChange', 0);
            });
        }

        function afterLeave(el: Element) {
            if (DEBUG) {
                console.warn('afterLeave', el);
            }
            autoHeight(el as HTMLElement);
            ctx.emit('afterLeave');
        }

        function fixedHeight(el: HTMLElement) {
            el.style.height = `${el.scrollHeight}px`;
            el.style.overflow = 'hidden';
            if (DEBUG) {
                console.warn('fixedHeight', el);
            }
            forceRepaint(el);
        }

        function autoHeight(el: HTMLElement) {
            el.style.overflow = '';
            el.style.height = '';
            if (DEBUG) {
                console.warn('autoHeight', el);
            }
            forceRepaint(el);
        }

        function zeroHeight(el: HTMLElement) {
            el.style.height = '0';
            if (DEBUG) {
                console.warn('zeroHeight', el);
            }
            forceRepaint(el);
        }

        function forceRepaint(el: Element) {
            // Force repaint to make sure the
            // animation is triggered correctly.
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            const height = getComputedStyle(el).height;
            if (DEBUG) {
                console.warn('forceRepaint', el, height);
            }
        }
    },
});
