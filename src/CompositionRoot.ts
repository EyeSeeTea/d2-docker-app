import { ContainersD2DockerApiRepository } from "./data/repositories/ContainerD2DockerApiRepository";

import { ListAllContainersUseCase } from "./domain/usecases/ListAllContainersUseCase";
import { StartContainerUseCase } from "./domain/usecases/StartContainerUseCase";
import { StopContainerUseCase } from "./domain/usecases/StopContainerUseCase";
import { ListProjectsUseCase } from "./domain/usecases/ListProjectsUseCase";
import { GetImagesUseCase } from "./domain/usecases/GetImagesUseCase";
import { CreateContainerImageUseCase } from "./domain/usecases/CreateContainerImageUseCase";
import { ImagesD2DockerApiRepository } from "./data/repositories/ImagesD2DockerApiRepository";

export function getCompositionRoot() {
    const containersRepository = new ContainersD2DockerApiRepository();
    const imagesRepository = new ImagesD2DockerApiRepository();

    return {
        container: {
            getAll: new ListAllContainersUseCase(containersRepository),
            start: new StartContainerUseCase(containersRepository),
            stop: new StopContainerUseCase(containersRepository),
            getProjects: new ListProjectsUseCase(imagesRepository),
            getImages: new GetImagesUseCase(imagesRepository),
            createImageAndStart: new CreateContainerImageUseCase(imagesRepository, containersRepository),
        },
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;
