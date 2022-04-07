import { FutureData } from "../entities/Future";
import { Container } from "../../domain/entities/Container";

export interface ContainerRepository {
    listAll(): FutureData<Container[]>;
    start(name: string): FutureData<any>;
    stop(name: string): FutureData<any>;
    listProjects(): FutureData<any>; //string[]
    listRepoArtifacts(project: string): FutureData<any>; //string[]
    createContainerImage(project: string, dhis2DataArtifact: string, name?: string): FutureData<any>;
}
