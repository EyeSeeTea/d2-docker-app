import { Future, FutureData } from "../entities/Future";
import { Image } from "../entities/Image";
import { ContainerRepository } from "../repositories/ContainerRepository";

export class StartContainerUseCase {
    constructor(private containerRepository: ContainerRepository) {}

    public execute(images: Image[]): FutureData<void> {
        const starts$ = images.map(images => this.containerRepository.start(images));
        return Future.parallel(starts$).map(() => undefined);
    }
}
