import { UseCase } from "../../CompositionRoot";
import { FutureData } from "../entities/Future";
import { Project } from "../entities/Project";
import { ContainerRepository } from "../repositories/ContainerRepository";

export class ListProjectsUseCase implements UseCase {
    constructor(private containerRepository: ContainerRepository) {}

    public execute(): FutureData<Project[]> {
        return this.containerRepository.getProjects();
    }
}
