import _ from "lodash";
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
        const { imagesRepository: imagesRepo, containersRepository: containersRepo } = this;
        const templateImage = getRemoteImageFromContainer(container);
        const localImage = getLocalImageFromContainer(container);
        const steps = 6;

        function run<T>(action: FutureData<T>, msg: string, image: Image, step: number): FutureData<T> {
            return emptyFuture().flatMap(() => {
                const percent = (step / (steps + 1)) * 100;
                const msgWithImage = `${msg}: ${image.name}`;
                options.onProgress(msgWithImage, percent);
                return action;
            });
        }

        const noop$ = Future.success(undefined) as FutureData<void>;
        const templateImageExistedInLocal$ = containersRepo.getAll().map(containers => {
            return _(containers).some(container => _.isEqual(container.image, templateImage));
        });

        if (container.existing) {
            return run(containersRepo.startInitial(container), i18n.t("Start image"), localImage, 1).map(
                () => undefined
            );
        } else {
            if (_.isEqual(localImage, templateImage))
                return Future.error(i18n.t("Cannot use same name for template and local image"));

            return templateImageExistedInLocal$.flatMap(templateImageExistsInLocal => {
                return emptyFuture()
                    .flatMap(() => run(imagesRepo.pull(templateImage), i18n.t("Pull remote image"), templateImage, 1))
                    .flatMap(() => run(imagesRepo.create(container), i18n.t("Copy image"), localImage, 2))
                    .flatMap(() =>
                        templateImageExistsInLocal
                            ? noop$
                            : run(imagesRepo.delete(templateImage), i18n.t("Delete template image"), localImage, 3)
                    )
                    .flatMap(() => run(imagesRepo.push(localImage), i18n.t("Push new image"), localImage, 4))
                    .flatMap(() => run(containersRepo.stop(localImage), i18n.t("Stop image"), localImage, 5))
                    .flatMap(() =>
                        run(containersRepo.startInitial(container), i18n.t("Start image"), localImage, steps)
                    )
                    .flatMap(({ url }) => this.openInBrowser(url));
            });
        }
    }

    private openInBrowser(url: string): FutureData<void> {
        window.open(url, "_blank");
        return Future.success(undefined);
    }
}

interface Options {
    onProgress: (msg: string, progressPercent: number) => void;
}
