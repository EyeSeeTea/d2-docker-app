import { Ref } from "./Ref";

export interface Container extends Ref {
    name: string;
    status: ContainerStatus;
}

export type ContainerStatus = "RUNNING" | "STOPPED";

export interface NewContainer {
    project: string;
    image: string;
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
