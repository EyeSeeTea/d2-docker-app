import { UseCase } from "../../CompositionRoot";
import { FutureData } from "../entities/Future";
import { ContainerRepository } from "../repositories/ContainerRepository";

export class CreateContainerImageUseCase implements UseCase {
    constructor(private containerRepository: ContainerRepository) {}

    public execute(project: string, dhis2DataArtifact: string, name?: string): FutureData<void> {
        return this.containerRepository.createContainerImage(project, dhis2DataArtifact, name);
    }
}
