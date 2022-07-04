import { FutureData } from "../entities/Future";
import { ContainerRepository } from "../repositories/ContainerRepository";

export class StartContainerUseCase {
    constructor(private containerRepository: ContainerRepository) {}

    public execute(name: string): FutureData<void> {
        return this.containerRepository.start(name);
    }
}
