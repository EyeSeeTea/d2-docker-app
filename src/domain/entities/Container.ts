import { Id } from "./Ref";

export interface Container {
    id: Id;
    name: string;
    status: ContainerStatus;
}

export type ContainerStatus = "RUNNING" | "STOPPED";

export interface NewContainer {
    project: string;
    image: string;
    port: number;
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

export const initialContainer: NewContainer = {
    project: "",
    image: "",
    port: 8080,
    name: "",
};
