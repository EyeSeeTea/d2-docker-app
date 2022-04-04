
export type ContainerStatus = "STARTED" | "STOPPED";

export interface Container {
    name: string;
    description: string;
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