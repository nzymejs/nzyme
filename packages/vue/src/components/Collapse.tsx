import { defineComponent, getCurrentInstance, Transition, withDirectives, vShow } from 'vue';

import { prop } from '../prop';

import css from './Collapse.module.scss';
import { LazyHydrate } from './LazyHydrate';

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
                    appear={true}
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
            zeroHeight(el as HTMLElement);
        }

        function enter(el: Element) {
            fixedHeight(el as HTMLElement);
            ctx.emit('heightChange', el.scrollHeight);
        }

        function afterEnter(el: Element) {
            autoHeight(el as HTMLElement);
            ctx.emit('afterEnter');
        }

        function leave(el: Element) {
            fixedHeight(el as HTMLElement);

            requestAnimationFrame(() => {
                zeroHeight(el as HTMLElement);
                ctx.emit('heightChange', 0);
            });
        }

        function afterLeave(el: Element) {
            autoHeight(el as HTMLElement);
        }

        function fixedHeight(el: HTMLElement) {
            el.style.height = `${el.scrollHeight}px`;
            el.style.overflow = 'hidden';
            forceRepaint(el);
        }

        function autoHeight(el: HTMLElement) {
            el.style.overflow = '';
            el.style.height = '';
            forceRepaint(el);
        }

        function zeroHeight(el: HTMLElement) {
            el.style.height = '0';
            forceRepaint(el);
        }

        function forceRepaint(el: Element) {
            // Force repaint to make sure the
            // animation is triggered correctly.
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            getComputedStyle(el).height;
        }
    },
});
