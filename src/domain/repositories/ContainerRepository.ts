import { FutureData } from "../entities/Future";
import { Container } from "../../domain/entities/Container";
import { Project } from "../entities/Project";
import { Image } from "../entities/Image";
import { Id } from "../entities/Ref";

export interface ContainerRepository {
    getAll(): FutureData<Container[]>;
    start(id: Id): FutureData<void>;
    stop(id: Id): FutureData<void>;
    getProjects(): FutureData<Project[]>;
    getImages(projectName: string): FutureData<Image[]>;
    createContainerImage(projectName: string, imageName: string): FutureData<void>;
}
