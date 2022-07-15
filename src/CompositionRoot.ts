import { ContainersD2DockerApiRepository } from "./data/repositories/ContainerD2DockerApiRepository";

import { ListAllContainersUseCase } from "./domain/usecases/ListAllContainersUseCase";
import { StartContainerUseCase } from "./domain/usecases/StartContainerUseCase";
import { StopContainerUseCase } from "./domain/usecases/StopContainerUseCase";
import { CreateContainerImageUseCase } from "./domain/usecases/CreateContainerImageUseCase";
import { ImagesD2DockerApiRepository } from "./data/repositories/ImagesD2DockerApiRepository";
import { CommitContainersUseCase } from "./domain/usecases/CommitContainersUseCase";
import { ImagesUseCases } from "./domain/usecases/ImagesUseCases";
import { Config } from "./domain/entities/Config";

export function getCompositionRoot(config: Config) {
    const containersRepository = new ContainersD2DockerApiRepository(config);
    const imagesRepository = new ImagesD2DockerApiRepository(config);

    return {
        container: {
            getAll: new ListAllContainersUseCase(containersRepository),
            start: new StartContainerUseCase(containersRepository),
            stop: new StopContainerUseCase(containersRepository),
            createImageAndStart: new CreateContainerImageUseCase(imagesRepository, containersRepository),
            commit: new CommitContainersUseCase(containersRepository),
        },
        images: new ImagesUseCases(imagesRepository),
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;
