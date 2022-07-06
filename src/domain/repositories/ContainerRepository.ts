import { FutureData } from "../entities/Future";
import { Container, NewContainer } from "../../domain/entities/Container";
import { Project } from "../entities/Project";
import { Image } from "../entities/Image";

export interface ContainerRepository {
    getAll(): FutureData<Container[]>;
    start(image: Image): FutureData<void>;
    startInitial(container: NewContainer): FutureData<void>;
    stop(image: Image): FutureData<void>;
    getProjects(): FutureData<Project[]>;
    getImages(projectName: string): FutureData<Image[]>;
    pullImage(image: Image): FutureData<void>;
    pushImage(image: Image): FutureData<void>;
    createImage(container: NewContainer): FutureData<void>;
}
