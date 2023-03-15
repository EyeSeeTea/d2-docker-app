export function downloadFromUrl(url: string): void {
    const element = document.querySelector<HTMLAnchorElement>("#download") || document.createElement("a");
    element.id = "download-file-" + new Date().getTime();
    element.href = url;
    element.target = "_blank";
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
}
