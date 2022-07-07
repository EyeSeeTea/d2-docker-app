import { Future, FutureData } from "../entities/Future";
import { Image } from "../entities/Image";
import { Project } from "../entities/Project";
import { ImagesRepository } from "../repositories/ImagesRepository";

export class ImagesUseCases {
    constructor(private imagesRepository: ImagesRepository) {}

    public get(project: string): FutureData<Image[]> {
        return this.imagesRepository.getForProject(project);
    }

    public getProjects(): FutureData<Project[]> {
        return this.imagesRepository.getProjects();
    }

    public push(images: Image[]): FutureData<void> {
        return Future.parallel(images.map(image => this.imagesRepository.push(image))).map(() => undefined);
    }

    public pull(images: Image[]): FutureData<void> {
        return Future.parallel(images.map(image => this.imagesRepository.pull(image))).map(() => undefined);
    }
}
