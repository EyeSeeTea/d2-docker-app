import i18n from "../../utils/i18n";
import {
    getRemoteImageFromContainer,
    getLocalImageFromContainer,
    ContainerDefinition,
    ContainerDefinitionValid,
} from "../entities/Container";
import { emptyFuture, Future, FutureData } from "../entities/Future";
import { Image } from "../entities/Image";
import { ContainerRepository } from "../repositories/ContainerRepository";

export class CreateContainerImageUseCase {
    constructor(private containerRepository: ContainerRepository) {}

    public execute(container: ContainerDefinitionValid, options: Options): FutureData<void> {
        const { containerRepository } = this;
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

        const pullImage$ = containerRepository.pullImage(remoteImage);
        const createImage = containerRepository.createImage(container);
        const pushImage$ = containerRepository.pushImage(localImage);
        const stopImage$ = containerRepository.stop(localImage);
        const startImage$ = containerRepository.startInitial(container);

        return emptyFuture()
            .flatMap(() => run(pullImage$, i18n.t("Pull image"), remoteImage, 1))
            .flatMap(() => run(createImage, i18n.t("Copy image"), localImage, 2))
            .flatMap(() => run(pushImage$, i18n.t("Push image"), localImage, 3))
            .flatMap(() => run(stopImage$, i18n.t("Stop image"), localImage, 4))
            .flatMap(() => run(startImage$, i18n.t("Start image"), localImage, 5))
            .flatMap(() => this.openInBrowser(container));
    }

    private openInBrowser(container: ContainerDefinition): FutureData<void> {
        const url = `http://localhost:${container.port}`;
        window.open(url, "_blank");
        return Future.success(undefined);
    }
}

interface Options {
    onProgress: (msg: string, progressPercent: number) => void;
}
