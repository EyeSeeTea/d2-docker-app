import { NewContainer } from "../entities/Container";
import { FutureData } from "../entities/Future";
import { Image } from "../entities/Image";
import { ContainerRepository } from "../repositories/ContainerRepository";

export class CreateContainerImageUseCase {
    constructor(private containerRepository: ContainerRepository) {}

    public execute(container: NewContainer): FutureData<void> {
        const repo = this.containerRepository;
        const remoteImage: Image = { project: container.project, name: container.image };
        const localImage: Image = { project: container.project, name: container.name };

        const createImage$ = repo.pullImage(remoteImage);
        const copyImage$ = repo.createImage(container);
        const pushImage$ = repo.pushImage(localImage);
        const startImage$ = repo.start(localImage);

        return createImage$
            .flatMap(() => copyImage$)
            .flatMap(() => pushImage$)
            .flatMap(() => startImage$);
    }
}
