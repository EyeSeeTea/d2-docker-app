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

type ImageAttrs = Omit<Image, "id" | "type" | "registryUrl">;

export function buildImage(attrs: ImageAttrs & { registryUrl?: string }): Image {
    return {
        type: "image",
        id: [attrs.project, attrs.dhis2Version, attrs.name].join("."),
        registryUrl: defaultRegistryUrl,
        ...attrs,
    };
}
