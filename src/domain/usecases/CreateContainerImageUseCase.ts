import i18n from "../../utils/i18n";
import {
    getRemoteImageFromContainer,
    getLocalImageFromContainer,
    ContainerDefinitionValid,
} from "../entities/Container";
import { emptyFuture, Future, FutureData } from "../entities/Future";
import { Image } from "../entities/Image";
import { ContainersRepository } from "../repositories/ContainersRepository";
import { ImagesRepository } from "../repositories/ImagesRepository";

export class CreateContainerImageUseCase {
    constructor(private imagesRepository: ImagesRepository, private containersRepository: ContainersRepository) {}

    public execute(container: ContainerDefinitionValid, options: Options): FutureData<void> {
        const { imagesRepository, containersRepository } = this;
        const remoteImage = getRemoteImageFromContainer(container);
        const localImage = getLocalImageFromContainer(container);
        const steps = 5;

        function run<T>(action: FutureData<T>, msg: string, image: Image, step: number): FutureData<T> {
            return emptyFuture().flatMap(() => {
                const percent = (step / (steps + 1)) * 100;
                const msgWithImage = `${msg}: ${image.name}`;
                options.onProgress(msgWithImage, percent);
                return action;
            });
        }

        const pullImage$ = imagesRepository.pull(remoteImage);
        const createImage = imagesRepository.create(container);
        const pushImage$ = imagesRepository.push(localImage);
        const stopImage$ = containersRepository.stop(localImage);
        const startImage$ = containersRepository.startInitial(container);

        return emptyFuture()
            .flatMap(() => run(pullImage$, i18n.t("Pull image"), remoteImage, 1))
            .flatMap(() => run(createImage, i18n.t("Copy image"), localImage, 2))
            .flatMap(() => run(pushImage$, i18n.t("Push image"), localImage, 3))
            .flatMap(() => run(stopImage$, i18n.t("Stop image"), localImage, 4))
            .flatMap(() => run(startImage$, i18n.t("Start image"), localImage, 5))
            .flatMap(({ url }) => this.openInBrowser(url));
    }

    private openInBrowser(url: string): FutureData<void> {
        window.open(url, "_blank");
        return Future.success(undefined);
    }
}

interface Options {
    onProgress: (msg: string, progressPercent: number) => void;
}
