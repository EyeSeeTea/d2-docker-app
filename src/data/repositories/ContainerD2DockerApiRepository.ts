import _ from "lodash";
import { FutureData } from "../../domain/entities/Future";
import { ContainersRepository } from "../../domain/repositories/ContainersRepository";
import { Container, getLocalImageFromContainer, ContainerDefinitionValid } from "../../domain/entities/Container";
import { buildImage, Image } from "../../domain/entities/Image";
import { fetchGet, fetchPost } from "../utils/future-fetch";
import { InstancesGetResponse, D2DockerStartRequest, D2DockerStopRequest, ApiContainer } from "./D2DockerApi.types";
import { Config } from "../../domain/entities/Config";
import { Maybe } from "../../types/utils";

export class ContainersD2DockerApiRepository implements ContainersRepository {
    d2DockerApiUrl: string;
    dhis2Host: string;

    constructor(config: Config) {
        this.d2DockerApiUrl = config.d2DockerApiUrl;
        this.dhis2Host = config.dhis2Host;
    }

    public getAll(): FutureData<Container[]> {
        return fetchGet<InstancesGetResponse>(this.getD2DockerApiUrl("/instances")).map(({ containers }) =>
            _(containers)
                .map((apiContainer): Maybe<Container> => {
                    const image = getImageFromRawName(apiContainer.name);
                    if (!image) return undefined;

                    return {
                        id: apiContainer.name,
                        name: apiContainer.name,
                        harborUrl: this.getHarborPublicDataImageUrl(image),
                        dhis2Url: this.getDhis2PublicUrlFromContainer(apiContainer),
                        image,
                        status: apiContainer.status,
                    };
                })
                .compact()
                .value()
        );
    }

    public start(image: Image): FutureData<void> {
        return fetchPost<D2DockerStartRequest, void>(this.getD2DockerApiUrl("/instances/start"), {
            data: {
                image: this.getDockerDataImage(image),
                detach: true,
            },
        });
    }

    public startInitial(definition: ContainerDefinitionValid): FutureData<{ url: string }> {
        return fetchPost<D2DockerStartRequest, void>(this.getD2DockerApiUrl("/instances/start"), {
            data: {
                image: this.getDockerDataImage(getLocalImageFromContainer(definition)),
                detach: true,
                port: parseInt(definition.port),
            },
        }).map(() => ({ url: this.getDhis2PublicUrl(definition.port) }));
    }

    public stop(image: Image): FutureData<void> {
        return fetchPost<D2DockerStopRequest, void>(this.getD2DockerApiUrl("/instances/stop"), {
            data: {
                image: this.getDockerDataImage(image),
            },
        });
    }

    public commit(container: Container): FutureData<void> {
        return fetchPost<D2DockerStopRequest, void>(this.getD2DockerApiUrl("/instances/commit"), {
            data: {
                image: this.getDockerDataImage(container.image),
            },
        });
    }

    /* Private methods */

    private getDockerDataImage(image: Image): string {
        const dhis2DataImageName = `dhis2-data:${image.dhis2Version}-${image.name}`;
        const parts = [image.registryUrl, image.project, dhis2DataImageName];
        return _.compact(parts).join("/");
    }

    private getD2DockerApiUrl(path: string): string {
        const path2 = path.replace(/^\//, "");
        return this.d2DockerApiUrl + "/" + path2;
    }

    private getHarborPublicDataImageUrl(image: Image): string | undefined {
        const parts = [image.registryUrl, "harbor/projects", image.project, "repositories/dhis2-data"];
        return `${image.registryUrl}/${parts.join("/")}`;
    }

    private getDhis2PublicUrlFromContainer(apiContainer: ApiContainer): string | undefined {
        return apiContainer.status === "RUNNING" ? this.getDhis2PublicUrl(apiContainer.port) : undefined;
    }

    private getDhis2PublicUrl(port: string | number): string {
        return `http://${this.dhis2Host}:${port}`;
    }
}

function getImageFromRawName(name: string): Image | undefined {
    // Example: docker.eyeseetea.com/samaritans/dhis2-data:2.36.9-sp-cpr
    const parts = name.split("/");

    switch (parts.length) {
        case 3: {
            const [registryUrl = "", projectName = "", name = ""] = parts;
            const name2 = name.split(":")[1];
            if (!name2) return;
            const sp = name2.split("-");
            const version = sp[0];
            const name3 = sp.slice(1).join("-");
            return version && name3
                ? buildImage({ registryUrl, project: projectName, dhis2Version: version, name: name3 })
                : undefined;
        }
        default:
            return undefined;
    }
}
