import { FutureData } from "../entities/Future";
import { Image } from "../entities/Image";
import { ImagesRepository } from "../repositories/ImagesRepository";

export class GetImagesUseCase {
    constructor(private imagesRepository: ImagesRepository) {}

    public execute(project: string): FutureData<Image[]> {
        return this.imagesRepository.getForProject(project);
    }
}
