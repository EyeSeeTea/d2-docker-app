import { Config } from "./Config";
import { Either } from "./Either";
import { Image } from "./Image";
import { Id } from "./Ref";
import { Struct } from "./Struct";

export interface Container {
    id: Id;
    name: string;
    status: ContainerStatus;
    harborUrl?: string;
    dhis2Url?: string;
    image: Image;
}

export type ContainerStatus = "RUNNING" | "STOPPED";

interface ContainerDefinitionProps {
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
    existing: boolean;
}

const nameRegex = /^[a-z0-9-]+$/;

export class ContainerDefinition extends Struct<ContainerDefinitionProps>() {}

type ContainerDefinitionValidProps = Omit<ContainerDefinition, "image"> & { image: Image };

export class ContainerDefinitionValid extends Struct<ContainerDefinitionValidProps>() {
    static validate(props: ContainerDefinitionValidProps): Either<string, ContainerDefinitionValid> {
        if (!nameRegex.test(props.name)) {
            return Either.error(
                `Invalid container name, valid characters are: lower case letters, digits, and hyphen (-)`
            );
        } else {
            return Either.success(new ContainerDefinitionValid(props));
        }
    }
}

export function getImageInfoFromName(name: string): Pick<Image, "dhis2Version" | "name"> | undefined {
    const match = name.match(/^([\d.]+)-(.*)$/);
    if (!match) return;
    const [_all, version, imageName] = match;
    if (!version || !imageName) return;
    return { dhis2Version: version, name: imageName };
}

export function getRemoteImageFromContainer(container: ContainerDefinitionValid): Image {
    return container.image;
}

export function getLocalImageFromContainer(container: ContainerDefinitionValid): Image {
    return { ...container.image, name: container.name };
}

export function initialContainer(config: Config): ContainerDefinition {
    return new ContainerDefinition({
        projectName: "",
        image: undefined,
        port: config.defaultDhis2Port.toString(),
        name: "",
        existing: false,
    });
}

export function getContainerDefinitionFromContainer(config: Config, container: Container): ContainerDefinition {
    const { image } = container;

    return new ContainerDefinition({
        ...initialContainer,
        projectName: image.project,
        image: image,
        port: config.defaultDhis2Port.toString(),
        name: image.name,
        existing: true,
    });
}
