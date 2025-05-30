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
        return this.run(images, image => this.imagesRepository.push(image));
    }

    public pull(images: Image[]): FutureData<void> {
        return this.run(images, image => this.imagesRepository.pull(image));
    }

    public delete(images: Image[]) {
        return this.run(images, image => this.imagesRepository.delete(image));
    }

    private run(images: Image[], action: (image: Image) => FutureData<unknown>): FutureData<void> {
        const actions$ = images.map(image => action(image));
        return Future.parallel(actions$).map(() => undefined);
    }
}
