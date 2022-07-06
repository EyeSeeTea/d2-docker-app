import { Id } from "./Ref";

export interface Image {
    type: "image";
    id: Id;
    registryUrl: string;
    project: string;
    dhis2Version: string;
    name: string;
}

export const defaultRegistryUrl = "docker.eyeseetea.com";

export function buildImage(attrs: Omit<Image, "id" | "type" | "registryUrl"> & { registryUrl?: string }): Image {
    return {
        type: "image",
        id: [attrs.project, attrs.dhis2Version, attrs.name].join("."),
        registryUrl: defaultRegistryUrl,
        ...attrs,
    };
}
