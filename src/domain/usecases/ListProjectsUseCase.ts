import { FutureData } from "../entities/Future";
import { Project } from "../entities/Project";
import { ImagesRepository } from "../repositories/ImagesRepository";

export class ListProjectsUseCase {
    constructor(private imagesRepository: ImagesRepository) {}

    public execute(): FutureData<Project[]> {
        return this.imagesRepository.getProjects();
    }
}
