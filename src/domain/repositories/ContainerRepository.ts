import { FutureData } from "../entities/Future";
import { Container } from "../../domain/entities/Container";
import { Project } from "../entities/Project";
import { Image } from "../entities/Image";

export interface ContainerRepository {
    getAll(): FutureData<Container[]>;
    start(name: string): FutureData<void>;
    stop(name: string): FutureData<void>;
    getProjects(): FutureData<Project[]>;
    getImages(project: string): FutureData<Image[]>;
    createContainerImage(projectName: string, imageName: string): FutureData<void>;
}
