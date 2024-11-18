export type ContainerScope = {
    readonly name: string;
};

/*#__NO_SIDE_EFFECTS__*/
export function defineScope(name: string) {
    return Object.freeze({
        name,
    });
}
