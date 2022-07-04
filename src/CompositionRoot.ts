import { ContainerD2DockerApiRepository } from "./data/repositories/ContainerD2DockerApiRepository";

import { ListAllContainersUseCase } from "./domain/usecases/ListAllContainersUseCase";
import { StartContainerUseCase } from "./domain/usecases/StartContainerUseCase";
import { StopContainerUseCase } from "./domain/usecases/StopContainerUseCase";
import { ListProjectsUseCase } from "./domain/usecases/ListProjectsUseCase";
import { GetImagesUseCase } from "./domain/usecases/GetImagesUseCase";
import { CreateContainerImageUseCase } from "./domain/usecases/CreateContainerImageUseCase";

export function getCompositionRoot() {
    const containerRepository = new ContainerD2DockerApiRepository();

    return {
        container: {
            getAll: new ListAllContainersUseCase(containerRepository),
            start: new StartContainerUseCase(containerRepository),
            stop: new StopContainerUseCase(containerRepository),
            getProjects: new ListProjectsUseCase(containerRepository),
            getImages: new GetImagesUseCase(containerRepository),
            createImage: new CreateContainerImageUseCase(containerRepository),
        },
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;
