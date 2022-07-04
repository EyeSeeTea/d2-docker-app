import { UseCase } from "../../CompositionRoot";
import { FutureData } from "../entities/Future";
import { ContainerRepository } from "../repositories/ContainerRepository";

export class CreateContainerImageUseCase implements UseCase {
    constructor(private containerRepository: ContainerRepository) {}

    public execute(projectName: string, imageName: string): FutureData<void> {
        return this.containerRepository.createContainerImage(projectName, imageName);
    }
}
