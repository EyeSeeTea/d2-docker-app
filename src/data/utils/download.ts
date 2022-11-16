export function downloadFromUrl(url: string): void {
    const element = document.querySelector<HTMLAnchorElement>("#download") || document.createElement("a");
    element.id = "download-file";
    element.href = url;
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
}
