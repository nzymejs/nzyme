import {
    Transition,
    TransitionProps as TransitionPropsVue,
    FunctionalComponent,
    TransitionGroup,
    TransitionGroupProps as TransitionGroupPropsVue,
    h,
} from 'vue';

export type TransitionProps = Omit<TransitionPropsVue, 'name' | `${string}Class` | 'css'> & {
    duration?: number;
};
type TransitionDefProps = Pick<TransitionPropsVue, keyof TransitionPropsVue & `${string}Class`>;

export type TransitionGroupProps = Omit<
    TransitionGroupPropsVue,
    'name' | `${string}Class` | 'css'
> & {
    duration?: number;
};
type Hook = (el: Element) => void;

export function defineTransition(def: TransitionDefProps) {
    const transition: FunctionalComponent<TransitionProps> = (props, ctx) => (
        <Transition
            {...props}
            {...def}
            mode={transitionMode(props)}
            onBeforeEnter={onBeforeEnter(props)}
            onAfterEnter={onAfterEnter(props)}
            onBeforeLeave={onBeforeLeave(props)}
            onAfterLeave={onAfterLeave(props)}
        >
            {ctx.slots.default?.()}
        </Transition>
    );

    return transition;
}

export function defineTransitionGroup(def: TransitionDefProps) {
    const transition: FunctionalComponent<TransitionGroupProps> = (props, ctx) => (
        <TransitionGroup
            {...props}
            {...def}
            onBeforeEnter={onBeforeEnter(props)}
            onAfterEnter={onAfterEnter(props)}
            onBeforeLeave={onBeforeLeave(props)}
            onAfterLeave={onAfterLeave(props)}
        >
            {ctx.slots.default?.()}
        </TransitionGroup>
    );

    return transition;
}

function transitionMode(props: TransitionProps) {
    return props?.mode ?? 'out-in';
}

function onBeforeEnter(props: TransitionProps) {
    return mergeHooks(props.onBeforeEnter, el => onBeforeTransition(props, el));
}

function onAfterEnter(props: TransitionProps) {
    return mergeHooks(props.onAfterEnter, el => onAfterTransition(props, el));
}

function onBeforeLeave(props: TransitionProps) {
    return mergeHooks(props.onBeforeLeave, el => onBeforeTransition(props, el));
}

function onAfterLeave(props: TransitionProps) {
    return mergeHooks(props.onAfterLeave, el => onAfterTransition(props, el));
}

function onBeforeTransition(props: TransitionProps, el: Element) {
    if (props.duration && el instanceof HTMLElement) {
        el.style.transitionDuration = `${props.duration / 1000}s`;
    }
}

function onAfterTransition(props: TransitionProps, el: Element) {
    if (el instanceof HTMLElement) {
        el.style.transitionDuration = '';
    }
}

function mergeHooks(hook1: Hook | Hook[] | undefined, hook2: Hook) {
    const hooks: Hook[] = [];
    if (Array.isArray(hook1)) {
        hooks.push(...hook1);
    } else if (hook1 != null) {
        hooks.push(hook1);
    }

    hooks.push(hook2);

    return hooks;
}
