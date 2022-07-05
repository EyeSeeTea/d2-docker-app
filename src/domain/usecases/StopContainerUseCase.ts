import { Future, FutureData } from "../entities/Future";
import { Image } from "../entities/Image";
import { Id } from "../entities/Ref";
import { ContainerRepository } from "../repositories/ContainerRepository";

export class StopContainerUseCase {
    constructor(private containerRepository: ContainerRepository) {}

    public execute(images: Image[]): FutureData<void> {
        return Future.parallel(images.map(image => this.containerRepository.stop(image))).map(() => undefined);
    }
}
