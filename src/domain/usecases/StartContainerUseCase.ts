import { Future, FutureData } from "../entities/Future";
import { Image } from "../entities/Image";
import { ContainersRepository } from "../repositories/ContainersRepository";

export class StartContainerUseCase {
    constructor(private containerRepository: ContainersRepository) {}

    public execute(images: Image[]): FutureData<void> {
        const starts$ = images.map(image => this.containerRepository.start(image));
        return Future.parallel(starts$).map(() => undefined);
    }
}
