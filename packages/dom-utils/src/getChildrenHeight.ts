/**
 * Returns height of element's children.
 * Even if element itself overflows.
 */
export function getChildrenHeight(element: HTMLElement) {
    let height = 0;

    for (const child of element.children) {
        if (!(child instanceof HTMLElement)) {
            continue;
        }

        const marginBottom = parseInt(getComputedStyle(child).marginBottom, 10);
        const bottom = child.offsetHeight + child.offsetTop + marginBottom;

        if (bottom > height) {
            height = bottom;
        }
    }

    return height;
}
