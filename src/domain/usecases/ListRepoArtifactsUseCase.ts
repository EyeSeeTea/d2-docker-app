import { UseCase } from "../../CompositionRoot";
import { FutureData } from "../entities/Future";
import { ContainerRepository } from "../repositories/ContainerRepository";

export class ListRepoArtifactsUseCase implements UseCase {
    constructor(private containerRepository: ContainerRepository) {}

    public execute(project: string): FutureData<any> {
        return this.containerRepository.listRepoArtifacts(project);
    }
}
