export function goTo(url: string, options: { newTab?: boolean } = {}) {
    const { newTab = true } = options;
    window.open(url, newTab ? "_blank" : undefined);
}
