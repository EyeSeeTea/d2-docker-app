import { FutureData } from "../entities/Future";
import { Image } from "../entities/Image";
import { ContainerRepository } from "../repositories/ContainerRepository";

export class GetImagesUseCase {
    constructor(private containerRepository: ContainerRepository) {}

    public execute(project: string): FutureData<Image[]> {
        return this.containerRepository.getImages(project);
    }
}
