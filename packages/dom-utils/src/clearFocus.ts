export function clearFocus() {
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
        active.blur();
    }
}
