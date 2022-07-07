import { Image } from "./Image";
import { Id } from "./Ref";

export interface Container {
    id: Id;
    name: string;
    status: ContainerStatus;
    harborUrl?: string;
    dhis2Url?: string;
    image: Image;
}

export type ContainerStatus = "RUNNING" | "STOPPED";

export interface NewContainer {
    projectName: string;
    image: Image | undefined;
    port: string;
    name: string;
    url?: string;
    dbPort?: string;
    deployPath?: string;
    javaOpt?: string;
    tomcatServerXml?: File;
    dhisConf?: File;
    runSql?: File;
    runScript?: File;
}

export type NewContainerValid = Omit<NewContainer, "image"> & { image: Image };

export function getImageInfoFromName(name: string): Pick<Image, "dhis2Version" | "name"> | undefined {
    const match = name.match(/^([\d.]+)-(.*)$/);
    if (!match) return;
    const [_all, version, imageName] = match;
    if (!version || !imageName) return;
    return { dhis2Version: version, name: imageName };
}

export function getRemoteImageFromContainer(container: NewContainerValid): Image {
    return container.image;
}

export function getLocalImageFromContainer(container: NewContainerValid): Image {
    return { ...container.image, name: container.name };
}

export const initialContainer: NewContainer = {
    projectName: "",
    image: undefined,
    port: "8080",
    name: "",
};

export function getNewContainerFromContainer(container: Container): NewContainer {
    const { image } = container;

    return {
        ...initialContainer,
        projectName: image.project,
        image: image,
        port: "8080",
        name: image.name,
    };
}
