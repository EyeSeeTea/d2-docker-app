import { Future, FutureData } from "../entities/Future";
import { Image } from "../entities/Image";
import { ContainerRepository } from "../repositories/ContainerRepository";

export class StopContainerUseCase {
    constructor(private containerRepository: ContainerRepository) {}

    public execute(images: Image[]): FutureData<void> {
        const stops$ = images.map(image => this.containerRepository.stop(image));
        return Future.parallel(stops$).map(() => undefined);
    }
}
