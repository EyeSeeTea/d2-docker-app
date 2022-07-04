import { Ref } from "./Ref";
export type ContainerStatus = "RUNNING" | "STOPPED";

export interface Container extends Ref {
    name: string;
    status: ContainerStatus;
}

export interface NewContainer {
    project: string;
    dhis2Data: string;
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
