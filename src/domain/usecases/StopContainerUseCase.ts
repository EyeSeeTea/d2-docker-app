import { Future, FutureData } from "../entities/Future";
import { Image } from "../entities/Image";
import { ContainersRepository } from "../repositories/ContainersRepository";

export class StopContainerUseCase {
    constructor(private containerRepository: ContainersRepository) {}

    public execute(images: Image[]): FutureData<void> {
        const stops$ = images.map(image => this.containerRepository.stop(image));
        return Future.parallel(stops$).map(() => undefined);
    }
}
