import { Id } from "./Ref";

export interface Image {
    type: "image";
    id: Id;
    registryUrl: string;
    project: string;
    dhis2Version: string;
    name: string;
}

type ImageAttrs = Omit<Image, "id" | "type">;

export function buildImage(attrs: ImageAttrs): Image {
    return {
        type: "image",
        id: [attrs.project, attrs.dhis2Version, attrs.name].join("."),
        ...attrs,
    };
}
