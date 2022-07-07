import { ContainerDefinition } from "../entities/Container";
import { FutureData } from "../entities/Future";
import { Image } from "../entities/Image";
import { Project } from "../entities/Project";

export interface ImagesRepository {
    getProjects(): FutureData<Project[]>;
    getForProject(projectName: string): FutureData<Image[]>;
    pull(image: Image): FutureData<void>;
    push(image: Image): FutureData<void>;
    create(container: ContainerDefinition): FutureData<void>;
}
