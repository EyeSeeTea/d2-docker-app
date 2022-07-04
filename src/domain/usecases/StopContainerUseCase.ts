import { Future, FutureData } from "../entities/Future";
import { Id } from "../entities/Ref";
import { ContainerRepository } from "../repositories/ContainerRepository";

export class StopContainerUseCase {
    constructor(private containerRepository: ContainerRepository) {}

    public execute(ids: Id[]): FutureData<void> {
        return Future.parallel(ids.map(id => this.containerRepository.stop(id))).map(() => undefined);
    }
}
