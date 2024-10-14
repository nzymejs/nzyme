export function getOuterHeight(element: HTMLElement) {
    const window = element.ownerDocument.defaultView!;
    const style = window.getComputedStyle(element);

    const height = element.offsetHeight;
    const marginTop = parseInt(style.getPropertyValue('margin-top'), 10);
    const marginBottom = parseInt(style.getPropertyValue('margin-bottom'), 10);

    return height + marginBottom + marginTop;
}
