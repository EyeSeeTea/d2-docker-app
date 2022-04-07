import { UseCase } from "../../CompositionRoot";
import { FutureData } from "../entities/Future";
import { ContainerRepository } from "../repositories/ContainerRepository";

export class ListProjectsUseCase implements UseCase {
    constructor(private containerRepository: ContainerRepository) {}

    public execute(): FutureData<any> {
        return this.containerRepository.listProjects();
    }
}
